import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";
import { ApiError } from "../lib/api";

const { loginMock, navigateMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  navigateMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  ApiError: class ApiError extends Error {},
  refreshAccessToken: vi.fn(),
  setRefreshSessionHandler: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  UNAUTHORIZED_EVENT: "commerce_os:unauthorized"
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock
  })
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockReset();
    navigateMock.mockReset();
  });

  it("renders login fields", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Commerce OS" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("submits credentials and redirects on success", async () => {
    loginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(loginMock).toHaveBeenCalledWith("admin@example.com", "Password123!");
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows a fallback error when login throws non-ApiError", async () => {
    loginMock.mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Unable to sign in")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows API error message when login throws ApiError", async () => {
    loginMock.mockRejectedValue(new ApiError("Invalid credentials", 401));
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("returns submit button label back to Sign In after failed submit", async () => {
    loginMock.mockRejectedValue(new Error("timeout"));
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    });
  });
});
