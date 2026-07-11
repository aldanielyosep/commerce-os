import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";

const { loginMock, navigateMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  navigateMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  ApiError: class ApiError extends Error {}
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
});
