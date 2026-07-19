import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DepartmentsPage } from "./DepartmentsPage";

const {
  listDepartmentsPageMock,
  getDepartmentMock,
  createDepartmentMock,
  updateDepartmentMock,
  deleteDepartmentMock
} = vi.hoisted(() => ({
  listDepartmentsPageMock: vi.fn(),
  getDepartmentMock: vi.fn(),
  createDepartmentMock: vi.fn(),
  updateDepartmentMock: vi.fn(),
  deleteDepartmentMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listDepartmentsPage: listDepartmentsPageMock,
  getDepartment: getDepartmentMock,
  createDepartment: createDepartmentMock,
  updateDepartment: updateDepartmentMock,
  deleteDepartment: deleteDepartmentMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token"
  })
}));

describe("DepartmentsPage sorting", () => {
  const firstPage = {
    items: [
      {
        id: 1,
        code: "HR",
        name: "Human Resources"
      }
    ],
    meta: {
      page: 1,
      per_page: 20,
      total_count: 2,
      total_pages: 2
    }
  };

  beforeEach(() => {
    listDepartmentsPageMock.mockReset();
    getDepartmentMock.mockReset();
    createDepartmentMock.mockReset();
    updateDepartmentMock.mockReset();
    deleteDepartmentMock.mockReset();

    listDepartmentsPageMock.mockResolvedValue(firstPage);
  });

  it("applies sorting controls to the paginated departments request", async () => {
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await screen.findByRole("heading", { name: "Departments" });

    await user.selectOptions(screen.getByLabelText("Sort By"), "code");

    await waitFor(() => {
      expect(listDepartmentsPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        order_by: "code",
        order_dir: undefined
      });
    });

    await user.selectOptions(screen.getByLabelText("Direction"), "desc");

    await waitFor(() => {
      expect(listDepartmentsPageMock).toHaveBeenNthCalledWith(3, "Bearer test-token", {
        page: 1,
        order_by: "code",
        order_dir: "desc"
      });
    });
  });

  it("applies search query to the paginated departments request", async () => {
    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await screen.findByRole("heading", { name: "Departments" });
    await user.type(screen.getByLabelText("Search"), "ops");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listDepartmentsPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        q: "ops",
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("creates a department from modal and refreshes list", async () => {
    createDepartmentMock.mockResolvedValue({ id: 2, code: "OPS", name: "Operations" });

    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await screen.findByRole("heading", { name: "Departments" });

    await user.click(screen.getByRole("button", { name: "Add Department" }));
    expect(screen.getByRole("heading", { name: "Create Department" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Code"), "OPS");
    await user.type(screen.getByLabelText("Name"), "Operations");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createDepartmentMock).toHaveBeenCalledWith("Bearer test-token", {
        code: "OPS",
        name: "Operations"
      });
    });

    expect(listDepartmentsPageMock).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Create Department" })).not.toBeInTheDocument();
    });
  });

  it("edits a department from row action", async () => {
    getDepartmentMock.mockResolvedValue({ id: 1, code: "HR", name: "Human Resources" });
    updateDepartmentMock.mockResolvedValue({ id: 1, code: "HR", name: "People Ops" });

    const user = userEvent.setup();

    render(<DepartmentsPage />);

    await screen.findByText("Human Resources");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    expect(screen.getByRole("heading", { name: "Edit Department" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "People Ops");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        code: "HR",
        name: "People Ops"
      });
    });
  });

  it("handles delete confirmation branches", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    deleteDepartmentMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<DepartmentsPage />);

    await screen.findByText("Human Resources");

    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteDepartmentMock).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });
  });

  it("navigates pagination and applies correct page params", async () => {
    listDepartmentsPageMock
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce({
        items: [{ id: 2, code: "OPS", name: "Operations" }],
        meta: {
          page: 2,
          per_page: 20,
          total_count: 2,
          total_pages: 2
        }
      })
      .mockResolvedValueOnce(firstPage);

    const user = userEvent.setup();
    render(<DepartmentsPage />);

    await screen.findByText("Human Resources");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(listDepartmentsPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 2,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });

    expect(await screen.findByText("Operations")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous" }));

    await waitFor(() => {
      expect(listDepartmentsPageMock).toHaveBeenNthCalledWith(3, "Bearer test-token", {
        page: 1,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("shows error state when initial request fails", async () => {
    listDepartmentsPageMock.mockReset();
    listDepartmentsPageMock.mockRejectedValue(new Error("Network error"));

    render(<DepartmentsPage />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });
});