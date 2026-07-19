import {
  ApiError,
  listUsersPage,
  setRefreshSessionHandler,
  UNAUTHORIZED_EVENT
} from "./api";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

describe("api refresh retry flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    setRefreshSessionHandler(null);
  });

  afterEach(() => {
    setRefreshSessionHandler(null);
  });

  it("retries the original request once with refreshed access token", async () => {
    const refreshHandler = vi.fn().mockResolvedValue({
      token: "Bearer refreshed-token",
      refresh_token: "new-refresh-token",
      refresh_token_expires_at: "2099-01-01T00:00:00Z",
      user: {
        id: 1,
        email: "admin@example.com",
        username: "admin",
        role: "admin",
        status: "active"
      }
    });

    localStorage.setItem("commerce_os_web_refresh_token", "stored-refresh-token");
    setRefreshSessionHandler(refreshHandler);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({ success: false, message: "Unauthorized", errors: ["expired"] }, 401)
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: true,
            data: [
              {
                id: 1,
                email: "admin@example.com",
                username: "admin",
                role: "admin",
                status: "active",
                employee_id: null,
                reset_password_sent_at: null
              }
            ],
            meta: {
              page: 1,
              per_page: 20,
              total_count: 1,
              total_pages: 1
            }
          },
          200
        )
      );

    const result = await listUsersPage("Bearer stale-token", { page: 1, per_page: 20 });

    expect(refreshHandler).toHaveBeenCalledWith("stored-refresh-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: expect.objectContaining({ Authorization: "Bearer stale-token" })
    });
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      headers: expect.objectContaining({ Authorization: "Bearer refreshed-token" })
    });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total_count).toBe(1);
  });

  it("emits unauthorized and throws when refresh cannot recover the request", async () => {
    const refreshHandler = vi.fn().mockResolvedValue(null);
    setRefreshSessionHandler(refreshHandler);
    localStorage.setItem("commerce_os_web_refresh_token", "stored-refresh-token");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Unauthorized", errors: ["invalid token"] }, 401)
    );

    const unauthorizedListener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, unauthorizedListener);

    await expect(listUsersPage("Bearer stale-token", { page: 1 })).rejects.toBeInstanceOf(ApiError);

    expect(refreshHandler).toHaveBeenCalledWith("stored-refresh-token");
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    window.removeEventListener(UNAUTHORIZED_EVENT, unauthorizedListener);
  });
});