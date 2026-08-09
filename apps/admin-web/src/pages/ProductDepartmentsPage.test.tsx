import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductDepartmentsPage } from "./ProductDepartmentsPage";

const {
  listProductDepartmentsPageMock,
  getProductDepartmentMock,
  createProductDepartmentMock,
  updateProductDepartmentMock,
  deleteProductDepartmentMock
} = vi.hoisted(() => ({
  listProductDepartmentsPageMock: vi.fn(),
  getProductDepartmentMock: vi.fn(),
  createProductDepartmentMock: vi.fn(),
  updateProductDepartmentMock: vi.fn(),
  deleteProductDepartmentMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listProductDepartmentsPage: listProductDepartmentsPageMock,
  getProductDepartment: getProductDepartmentMock,
  createProductDepartment: createProductDepartmentMock,
  updateProductDepartment: updateProductDepartmentMock,
  deleteProductDepartment: deleteProductDepartmentMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token"
  })
}));

describe("ProductDepartmentsPage", () => {
  const firstPage = {
    items: [
      {
        id: 1,
        code: "BAG",
        name: "Bags"
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
    listProductDepartmentsPageMock.mockReset();
    getProductDepartmentMock.mockReset();
    createProductDepartmentMock.mockReset();
    updateProductDepartmentMock.mockReset();
    deleteProductDepartmentMock.mockReset();

    listProductDepartmentsPageMock.mockResolvedValue(firstPage);
  });

  it("applies sorting controls to the paginated product departments request", async () => {
    const user = userEvent.setup();

    render(<ProductDepartmentsPage />);

    await screen.findByRole("heading", { name: "Product Departments" });

    await user.selectOptions(screen.getByLabelText("Sort By"), "code");

    await waitFor(() => {
      expect(listProductDepartmentsPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        order_by: "code",
        order_dir: undefined
      });
    });

    await user.selectOptions(screen.getByLabelText("Direction"), "desc");

    await waitFor(() => {
      expect(listProductDepartmentsPageMock).toHaveBeenNthCalledWith(3, "Bearer test-token", {
        page: 1,
        order_by: "code",
        order_dir: "desc"
      });
    });
  });

  it("applies search query to the paginated product departments request", async () => {
    const user = userEvent.setup();

    render(<ProductDepartmentsPage />);

    await screen.findByRole("heading", { name: "Product Departments" });
    await user.type(screen.getByLabelText("Search"), "bag");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listProductDepartmentsPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        q: "bag",
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("creates a product department from modal and refreshes list", async () => {
    createProductDepartmentMock.mockResolvedValue({ id: 2, code: "ACC", name: "Accessories" });

    const user = userEvent.setup();

    render(<ProductDepartmentsPage />);

    await screen.findByRole("heading", { name: "Product Departments" });

    await user.click(screen.getByRole("button", { name: "Add Product Department" }));
    expect(screen.getByRole("heading", { name: "Create Product Department" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Code"), "ACC");
    await user.type(screen.getByLabelText("Name"), "Accessories");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createProductDepartmentMock).toHaveBeenCalledWith("Bearer test-token", {
        code: "ACC",
        name: "Accessories"
      });
    });

    expect(listProductDepartmentsPageMock).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Create Product Department" })).not.toBeInTheDocument();
    });
  });

  it("edits a product department from row action", async () => {
    getProductDepartmentMock.mockResolvedValue({ id: 1, code: "BAG", name: "Bags" });
    updateProductDepartmentMock.mockResolvedValue({ id: 1, code: "BAG", name: "Bags Updated" });

    const user = userEvent.setup();

    render(<ProductDepartmentsPage />);

    await screen.findByText("Bags");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getProductDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    expect(screen.getByRole("heading", { name: "Edit Product Department" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Bags Updated");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateProductDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        code: "BAG",
        name: "Bags Updated"
      });
    });
  });

  it("handles delete confirmation branches", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    deleteProductDepartmentMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ProductDepartmentsPage />);

    await screen.findByText("Bags");

    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteProductDepartmentMock).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteProductDepartmentMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });
  });

  it("shows error state when initial request fails", async () => {
    listProductDepartmentsPageMock.mockReset();
    listProductDepartmentsPageMock.mockRejectedValue(new Error("Network error"));

    render(<ProductDepartmentsPage />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });
});
