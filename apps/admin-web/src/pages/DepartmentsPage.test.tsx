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
  beforeEach(() => {
    listDepartmentsPageMock.mockReset();
    getDepartmentMock.mockReset();
    createDepartmentMock.mockReset();
    updateDepartmentMock.mockReset();
    deleteDepartmentMock.mockReset();

    listDepartmentsPageMock.mockResolvedValue({
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
        total_count: 1,
        total_pages: 1
      }
    });
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
});