import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmployeesPage } from "./EmployeesPage";

const {
  authState,
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
  authState: {
    token: "Bearer test-token",
    user: {
      id: 7,
      email: "admin@example.com",
      username: "admin",
      role: "admin_company",
      status: "active"
    }
  },
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
  useAuth: () => authState
}));

describe("EmployeesPage pagination", () => {
  const alice = {
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
  };

  const bob = {
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
  };

  beforeEach(() => {
    authState.user.role = "admin_company";
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
        items: [alice],
        meta: {
          page: 1,
          per_page: 20,
          total_count: 2,
          total_pages: 2
        }
      })
      .mockResolvedValueOnce({
        items: [bob],
        meta: {
          page: 2,
          per_page: 20,
          total_count: 2,
          total_pages: 2
        }
      });
  });

  it("loads next page using pagination metadata", async () => {
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

  it("applies all filters and reset", async () => {
    listEmployeesPageMock.mockReset();
    listEmployeesPageMock
      .mockResolvedValueOnce({
        items: [alice],
        meta: {
          page: 1,
          per_page: 20,
          total_count: 1,
          total_pages: 1
        }
      })
      .mockResolvedValue({
        items: [alice],
        meta: {
          page: 1,
          per_page: 20,
          total_count: 1,
          total_pages: 1
        }
      });

    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByRole("heading", { name: "Employees" });
    await user.selectOptions(screen.getByLabelText("Status"), "active");
    await user.selectOptions(screen.getByLabelText("Department"), "1");
    await user.type(screen.getByPlaceholderText("Employee ID, name, or email"), "alice");
    await user.selectOptions(screen.getByLabelText("Sort By"), "employee_id");
    await user.selectOptions(screen.getByLabelText("Direction"), "desc");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listEmployeesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        status: "active",
        department_id: 1,
        q: "alice",
        order_by: "employee_id",
        order_dir: "desc"
      });
    });

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(listEmployeesPageMock).toHaveBeenLastCalledWith("Bearer test-token", { page: 1 });
    });
  });

  it("creates employee through modal", async () => {
    createEmployeeMock.mockResolvedValue(alice);
    listEmployeesPageMock.mockResolvedValue({
      items: [alice],
      meta: {
        page: 1,
        per_page: 20,
        total_count: 1,
        total_pages: 1
      }
    });

    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("button", { name: "Add Employee" }));

    await user.type(screen.getByLabelText("Full Name"), "Charlie Doe");
    await user.selectOptions(screen.getByLabelText("Gender"), "male");
    await user.type(screen.getByLabelText("Birth Date"), "1995-01-01");
    await user.type(screen.getByLabelText("Join Date"), "2024-01-10");
    await user.type(screen.getByLabelText("Identity Number"), "ID-099");
    await user.type(screen.getByLabelText("Phone Number"), "+628999");
    await user.type(screen.getByLabelText("Email"), "charlie@example.com");
    await user.type(screen.getByLabelText("City"), "Depok");
    await user.type(screen.getByLabelText("Postal Code"), "16411");
    await user.type(screen.getByLabelText("Address"), "Street 99");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createEmployeeMock).toHaveBeenCalledWith("Bearer test-token", {
        full_name: "Charlie Doe",
        gender: "male",
        birth_date: "1995-01-01",
        join_date: "2024-01-10",
        identity_number: "ID-099",
        phone_number: "+628999",
        email: "charlie@example.com",
        city: "Depok",
        postal_code: "16411",
        address: "Street 99"
      });
    });
  });

  it("edits employee and updates profile", async () => {
    getEmployeeMock.mockResolvedValue(alice);
    updateEmployeeMock.mockResolvedValue({ ...alice, full_name: "Alice Updated" });
    listEmployeesPageMock.mockResolvedValue({
      items: [alice],
      meta: {
        page: 1,
        per_page: 20,
        total_count: 1,
        total_pages: 1
      }
    });

    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getEmployeeMock).toHaveBeenCalledWith("Bearer test-token", 11);
    });

    await user.clear(screen.getByLabelText("Full Name"));
    await user.type(screen.getByLabelText("Full Name"), "Alice Updated");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateEmployeeMock).toHaveBeenCalledWith("Bearer test-token", 11, expect.objectContaining({
        full_name: "Alice Updated"
      }));
    });
  });

  it("views employee assignments and supports assign/remove", async () => {
    getEmployeeMock.mockResolvedValue(alice);
    listEmployeeDepartmentsMock
      .mockResolvedValueOnce([
        {
          id: 1,
          assigned_date: "2024-01-10",
          department: { id: 1, code: "ENG", name: "Engineering" }
        }
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          assigned_date: "2024-01-10",
          department: { id: 1, code: "ENG", name: "Engineering" }
        },
        {
          id: 2,
          assigned_date: "2024-02-01",
          department: { id: 1, code: "ENG", name: "Engineering" }
        }
      ])
      .mockResolvedValueOnce([]);
    assignEmployeeDepartmentMock.mockResolvedValue({
      id: 2,
      assigned_date: "2024-02-01",
      department: { id: 1, code: "ENG", name: "Engineering" }
    });
    removeEmployeeDepartmentMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getByRole("button", { name: "View" }));

    await waitFor(() => {
      expect(listEmployeeDepartmentsMock).toHaveBeenCalledWith("Bearer test-token", 11);
    });

    expect(await screen.findByText("Department Assignments")).toBeInTheDocument();
    await user.selectOptions(screen.getAllByLabelText("Department")[1], "1");
    await user.clear(screen.getByLabelText("Assigned Date"));
    await user.type(screen.getByLabelText("Assigned Date"), "2024-02-01");
    await user.click(screen.getByRole("button", { name: "Assign" }));

    await waitFor(() => {
      expect(assignEmployeeDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 11, {
        department_id: 1,
        assigned_date: "2024-02-01"
      });
    });

    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    await waitFor(() => {
      expect(removeEmployeeDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 11, 1);
    });
  });

  it("shows terminate and delete only for super_admin and executes both actions", async () => {
    authState.user.role = "super_admin";
    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockReturnValue(true);

    terminateEmployeeMock.mockResolvedValue({ ...alice, status: "terminated" });
    deleteEmployeeMock.mockResolvedValue(undefined);
    getEmployeeMock.mockResolvedValue(alice);
    listEmployeeDepartmentsMock.mockResolvedValue([]);
    listEmployeesPageMock.mockResolvedValue({
      items: [alice],
      meta: {
        page: 1,
        per_page: 20,
        total_count: 1,
        total_pages: 1
      }
    });

    const user = userEvent.setup();
    render(<EmployeesPage />);

    await screen.findByText("Alice Johnson");
    await user.click(screen.getAllByRole("button", { name: "Terminate" })[0]);

    await waitFor(() => {
      expect(terminateEmployeeMock).toHaveBeenCalledWith("Bearer test-token", 11);
    });

    await user.click(screen.getByRole("button", { name: "View" }));
    await screen.findByText("Department Assignments");
    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    await waitFor(() => {
      expect(deleteEmployeeMock).toHaveBeenCalledWith("Bearer test-token", 11);
    });
  });
});