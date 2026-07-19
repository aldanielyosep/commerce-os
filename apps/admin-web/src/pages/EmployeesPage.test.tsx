import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmployeesPage } from "./EmployeesPage";

const {
  listDepartmentsMock,
  listEmployeesPageMock,
  assignEmployeeDepartmentMock,
  createEmployeeMock,
  deleteEmployeeMock,
  getEmployeeMock,
  listEmployeeDepartmentsMock,
  removeEmployeeDepartmentMock,
  terminateEmployeeMock,
  updateEmployeeMock
} = vi.hoisted(() => ({
  listDepartmentsMock: vi.fn(),
  listEmployeesPageMock: vi.fn(),
  assignEmployeeDepartmentMock: vi.fn(),
  createEmployeeMock: vi.fn(),
  deleteEmployeeMock: vi.fn(),
  getEmployeeMock: vi.fn(),
  listEmployeeDepartmentsMock: vi.fn(),
  removeEmployeeDepartmentMock: vi.fn(),
  terminateEmployeeMock: vi.fn(),
  updateEmployeeMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listDepartments: listDepartmentsMock,
  listEmployeesPage: listEmployeesPageMock,
  assignEmployeeDepartment: assignEmployeeDepartmentMock,
  createEmployee: createEmployeeMock,
  deleteEmployee: deleteEmployeeMock,
  getEmployee: getEmployeeMock,
  listEmployeeDepartments: listEmployeeDepartmentsMock,
  removeEmployeeDepartment: removeEmployeeDepartmentMock,
  terminateEmployee: terminateEmployeeMock,
  updateEmployee: updateEmployeeMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token",
    user: {
      id: 7,
      email: "admin@example.com",
      username: "admin",
      role: "admin_company",
      status: "active"
    }
  })
}));

describe("EmployeesPage pagination", () => {
  beforeEach(() => {
    listDepartmentsMock.mockReset();
    listEmployeesPageMock.mockReset();
    assignEmployeeDepartmentMock.mockReset();
    createEmployeeMock.mockReset();
    deleteEmployeeMock.mockReset();
    getEmployeeMock.mockReset();
    listEmployeeDepartmentsMock.mockReset();
    removeEmployeeDepartmentMock.mockReset();
    terminateEmployeeMock.mockReset();
    updateEmployeeMock.mockReset();

    listDepartmentsMock.mockResolvedValue([
      {
        id: 1,
        code: "ENG",
        name: "Engineering"
      }
    ]);

    listEmployeesPageMock
      .mockResolvedValueOnce({
        items: [
          {
            id: 11,
            employee_id: "EMP-011",
            full_name: "Alice Johnson",
            gender: "female",
            birth_date: "1992-02-03",
            join_date: "2024-01-02",
            status: "active",
            identity_number: "ID-011",
            phone_number: "+628111",
            city: "Jakarta",
            email: "alice@example.com",
            address: "Street 1",
            postal_code: "10110"
          }
        ],
        meta: {
          page: 1,
          per_page: 20,
          total_count: 2,
          total_pages: 2
        }
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 12,
            employee_id: "EMP-012",
            full_name: "Bob Smith",
            gender: "male",
            birth_date: "1991-01-01",
            join_date: "2023-10-10",
            status: "probation",
            identity_number: "ID-012",
            phone_number: "+628222",
            city: "Bandung",
            email: "bob@example.com",
            address: "Street 2",
            postal_code: "40111"
          }
        ],
        meta: {
          page: 2,
          per_page: 20,
          total_count: 2,
          total_pages: 2
        }
      });
  });

  it("loads next page using pagination metadata" , async () => {
    const user = userEvent.setup();

    render(<EmployeesPage />);

    expect(await screen.findByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2 (2 total)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(listEmployeesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", { page: 2 });
    });

    expect(await screen.findByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2 (2 total)")).toBeInTheDocument();
  });

  it("applies sorting controls to the paginated employees request", async () => {
    listEmployeesPageMock.mockReset();
    listEmployeesPageMock
      .mockResolvedValueOnce({
        items: [],
        meta: {
          page: 1,
          per_page: 20,
          total_count: 0,
          total_pages: 0
        }
      })
      .mockResolvedValueOnce({
        items: [],
        meta: {
          page: 1,
          per_page: 20,
          total_count: 0,
          total_pages: 0
        }
      });

    const user = userEvent.setup();

    render(<EmployeesPage />);

    await screen.findByRole("heading", { name: "Employees" });

    await user.selectOptions(screen.getByLabelText("Sort By"), "employee_id");
    await user.selectOptions(screen.getByLabelText("Direction"), "desc");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listEmployeesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        order_by: "employee_id",
        order_dir: "desc"
      });
    });
  });
});