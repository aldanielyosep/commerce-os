import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersPage } from "./UsersPage";

const {
  listUsersPageMock,
  listEmployeesMock,
  listCompaniesMock,
  listUserCompanyAssignmentsMock,
  createUserCompanyAssignmentMock,
  deleteUserCompanyAssignmentMock,
  getUserMock,
  createUserMock,
  updateUserMock,
  deleteUserMock,
  enableUserMock,
  disableUserMock,
  changeUserRoleMock,
  resetUserPasswordMock
} = vi.hoisted(() => ({
  listUsersPageMock: vi.fn(),
  listEmployeesMock: vi.fn(),
  listCompaniesMock: vi.fn(),
  listUserCompanyAssignmentsMock: vi.fn(),
  createUserCompanyAssignmentMock: vi.fn(),
  deleteUserCompanyAssignmentMock: vi.fn(),
  getUserMock: vi.fn(),
  createUserMock: vi.fn(),
  updateUserMock: vi.fn(),
  deleteUserMock: vi.fn(),
  enableUserMock: vi.fn(),
  disableUserMock: vi.fn(),
  changeUserRoleMock: vi.fn(),
  resetUserPasswordMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listUsersPage: listUsersPageMock,
  listEmployees: listEmployeesMock,
  listCompanies: listCompaniesMock,
  listUserCompanyAssignments: listUserCompanyAssignmentsMock,
  createUserCompanyAssignment: createUserCompanyAssignmentMock,
  deleteUserCompanyAssignment: deleteUserCompanyAssignmentMock,
  getUser: getUserMock,
  createUser: createUserMock,
  updateUser: updateUserMock,
  deleteUser: deleteUserMock,
  enableUser: enableUserMock,
  disableUser: disableUserMock,
  changeUserRole: changeUserRoleMock,
  resetUserPassword: resetUserPasswordMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token",
    user: {
      id: 99,
      email: "super@example.com",
      username: "super",
      role: "super_admin",
      status: "active"
    }
  })
}));

describe("UsersPage assignment management", () => {
  beforeEach(() => {
    listUsersPageMock.mockReset();
    listEmployeesMock.mockReset();
    listCompaniesMock.mockReset();
    listUserCompanyAssignmentsMock.mockReset();
    createUserCompanyAssignmentMock.mockReset();
    deleteUserCompanyAssignmentMock.mockReset();
    getUserMock.mockReset();
    createUserMock.mockReset();
    updateUserMock.mockReset();
    deleteUserMock.mockReset();
    enableUserMock.mockReset();
    disableUserMock.mockReset();
    changeUserRoleMock.mockReset();
    resetUserPasswordMock.mockReset();

    listUsersPageMock.mockResolvedValue({
      items: [
        {
          id: 1,
          email: "admin1@example.com",
          username: null,
          role: "admin_company",
          status: "active",
          employee_id: null,
          reset_password_sent_at: null
        },
        {
          id: 2,
          email: "admin2@example.com",
          username: "admin2",
          role: "admin_storefront_ops",
          status: "disabled",
          employee_id: 7,
          reset_password_sent_at: null
        }
      ],
      meta: {
        page: 1,
        per_page: 20,
        total_count: 2,
        total_pages: 1
      }
    });

    listEmployeesMock.mockResolvedValue([
      {
        id: 7,
        employee_id: "EMP-007",
        full_name: "Jane Doe",
        gender: "female",
        birth_date: "1998-02-01",
        join_date: "2020-05-01",
        status: "active",
        identity_number: "ID-007",
        phone_number: "+620001",
        city: "Jakarta",
        email: "jane@example.com",
        address: "Street",
        postal_code: "10110"
      }
    ]);
    listCompaniesMock.mockResolvedValue([
      {
        id: 10,
        code: "ALPHA",
        name: "Alpha Store",
        owner_name: "Owner",
        company_type: "pt",
        email: "alpha@example.com",
        phone: "+6200000",
        website: null,
        description: null,
        address: null,
        province: null,
        city: null,
        postal_code: null,
        latitude: null,
        longitude: null,
        status: "active",
        company_registration_number: null,
        nib: null,
        siup: null,
        deed_number: null,
        pkp_number: null,
        logo_url: null,
        marketplace_links: []
      },
      {
        id: 11,
        code: "BETA",
        name: "Beta Store",
        owner_name: "Owner",
        company_type: "pt",
        email: "beta@example.com",
        phone: "+6200001",
        website: null,
        description: null,
        address: null,
        province: null,
        city: null,
        postal_code: null,
        latitude: null,
        longitude: null,
        status: "active",
        company_registration_number: null,
        nib: null,
        siup: null,
        deed_number: null,
        pkp_number: null,
        logo_url: null,
        marketplace_links: []
      }
    ]);
  });

  it("loads and renders selected user's company assignments", async () => {
    listUserCompanyAssignmentsMock.mockResolvedValue([
      {
        id: 100,
        user_id: 1,
        company_id: 10,
        role_in_company: "manager",
        company: {
          id: 10,
          code: "ALPHA",
          name: "Alpha Store"
        }
      }
    ]);

    const user = userEvent.setup();
    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("User"), "1");

    await waitFor(() => {
      expect(listUserCompanyAssignmentsMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    expect(await screen.findByText("Alpha Store")).toBeInTheDocument();
    expect(screen.getByText("manager")).toBeInTheDocument();
  });

  it("applies sorting controls to the paginated users request", async () => {
    listUsersPageMock.mockReset();
    listUsersPageMock
      .mockResolvedValueOnce({
        items: [
          {
            id: 1,
            email: "admin1@example.com",
            username: null,
            role: "admin_company",
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
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 1,
            email: "admin1@example.com",
            username: null,
            role: "admin_company",
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
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 1,
            email: "admin1@example.com",
            username: null,
            role: "admin_company",
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
      });

    const user = userEvent.setup();
    render(<UsersPage />);

    await screen.findByRole("heading", { name: "Users" });

    await user.selectOptions(screen.getByLabelText("Sort By"), "email");

    await waitFor(() => {
      expect(listUsersPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        order_by: "email",
        order_dir: undefined
      });
    });

    await user.selectOptions(screen.getByLabelText("Direction"), "desc");

    await waitFor(() => {
      expect(listUsersPageMock).toHaveBeenNthCalledWith(3, "Bearer test-token", {
        page: 1,
        order_by: "email",
        order_dir: "desc"
      });
    });
  });

  it("creates and removes assignment for selected user", async () => {
    listUserCompanyAssignmentsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 101,
          user_id: 1,
          company_id: 11,
          role_in_company: "owner",
          company: {
            id: 11,
            code: "BETA",
            name: "Beta Store"
          }
        }
      ])
      .mockResolvedValueOnce([]);

    createUserCompanyAssignmentMock.mockResolvedValue({
      id: 101,
      user_id: 1,
      company_id: 11,
      role_in_company: "owner",
      company: {
        id: 11,
        code: "BETA",
        name: "Beta Store"
      }
    });

    deleteUserCompanyAssignmentMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("User"), "1");

    await waitFor(() => {
      expect(listUserCompanyAssignmentsMock).toHaveBeenCalledTimes(1);
    });

    await user.selectOptions(screen.getByLabelText("Company"), "11");
    await user.type(screen.getByLabelText("Role in Company"), "owner");
    await user.click(screen.getByRole("button", { name: "Assign Company" }));

    await waitFor(() => {
      expect(createUserCompanyAssignmentMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        company_id: 11,
        role_in_company: "owner"
      });
    });

    expect(await screen.findByText("Beta Store")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(deleteUserCompanyAssignmentMock).toHaveBeenCalledWith("Bearer test-token", 1, 101);
    });

    await waitFor(() => {
      expect(screen.getByText("No company assignments for this user.")).toBeInTheDocument();
    });
  });

  it("handles create/edit/status/role/reset/delete user actions", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    getUserMock.mockResolvedValue({
      id: 1,
      email: "admin1@example.com",
      username: "admin1",
      role: "admin_company",
      status: "active",
      employee_id: 7,
      reset_password_sent_at: null
    });
    createUserMock.mockResolvedValue({ id: 3 });
    updateUserMock.mockResolvedValue({ id: 1 });
    disableUserMock.mockResolvedValue({ id: 1 });
    enableUserMock.mockResolvedValue({ id: 2 });
    changeUserRoleMock.mockResolvedValue({ id: 2 });
    resetUserPasswordMock.mockResolvedValue(undefined);
    deleteUserMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add User" }));
    await user.type(screen.getByLabelText("Email"), "new-admin@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123!");
    await user.selectOptions(screen.getByLabelText("Status"), "disabled");
    await user.selectOptions(screen.getByLabelText("Employee Link"), "7");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalledWith("Bearer test-token", {
        email: "new-admin@example.com",
        username: undefined,
        password: "Password123!",
        password_confirmation: "Password123!",
        role: "admin_company",
        status: "disabled",
        employee_id: 7
      });
    });

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await waitFor(() => {
      expect(getUserMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    const usernameInput = screen.getByLabelText("Username");
    await user.clear(usernameInput);
    await user.type(usernameInput, "editor-1");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        email: "admin1@example.com",
        username: "editor-1",
        employee_id: 7
      });
    });

    await user.click(screen.getByRole("button", { name: "Disable" }));
    await waitFor(() => {
      expect(disableUserMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    await user.click(screen.getByRole("button", { name: "Enable" }));
    await waitFor(() => {
      expect(enableUserMock).toHaveBeenCalledWith("Bearer test-token", 2);
    });

    await user.click(screen.getAllByRole("button", { name: "Set Company Admin" })[1]);
    await waitFor(() => {
      expect(changeUserRoleMock).toHaveBeenCalledWith("Bearer test-token", 2, "admin_company");
    });

    await user.click(screen.getAllByRole("button", { name: "Set Storefront Ops" })[0]);
    await waitFor(() => {
      expect(changeUserRoleMock).toHaveBeenCalledWith("Bearer test-token", 1, "admin_storefront_ops");
    });

    await user.click(screen.getAllByRole("button", { name: "Reset Password" })[0]);
    await waitFor(() => {
      expect(resetUserPasswordMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);
    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalledWith("Bearer test-token", 2);
    });

    expect(confirmSpy).toHaveBeenCalledWith("Delete user admin2@example.com?");
    confirmSpy.mockRestore();
  });

  it("shows assignment error when assignment fetch fails", async () => {
    listUserCompanyAssignmentsMock.mockRejectedValue(new Error("Forbidden"));

    const user = userEvent.setup();
    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("User"), "1");

    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
  });

  it("does not delete user when confirmation is cancelled", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    expect(confirmSpy).toHaveBeenCalledWith("Delete user admin2@example.com?");
    expect(deleteUserMock).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("shows error when create user submission fails", async () => {
    createUserMock.mockRejectedValue(new Error("Create failed"));
    const user = userEvent.setup();

    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add User" }));

    await user.type(screen.getByLabelText("Email"), "fail-create@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Create failed")).toBeInTheDocument();
  });

  it("shows error when edit user submission fails", async () => {
    getUserMock.mockResolvedValue({
      id: 1,
      email: "admin1@example.com",
      username: "admin1",
      role: "admin_company",
      status: "active",
      employee_id: 7,
      reset_password_sent_at: null
    });
    updateUserMock.mockRejectedValue(new Error("Update failed"));
    const user = userEvent.setup();

    render(<UsersPage />);

    expect(await screen.findByRole("heading", { name: "Users" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await waitFor(() => {
      expect(getUserMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    const usernameInput = screen.getByLabelText("Username");
    await user.clear(usernameInput);
    await user.type(usernameInput, "new-editor");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Update failed")).toBeInTheDocument();
  });
});
