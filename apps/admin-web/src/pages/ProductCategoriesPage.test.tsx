import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCategoriesPage } from "./ProductCategoriesPage";

const {
  listProductDepartmentsMock,
  listCategoriesPageMock,
  getCategoryMock,
  createCategoryMock,
  updateCategoryMock,
  deleteCategoryMock
} = vi.hoisted(() => ({
  listProductDepartmentsMock: vi.fn(),
  listCategoriesPageMock: vi.fn(),
  getCategoryMock: vi.fn(),
  createCategoryMock: vi.fn(),
  updateCategoryMock: vi.fn(),
  deleteCategoryMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listProductDepartments: listProductDepartmentsMock,
  listCategoriesPage: listCategoriesPageMock,
  getCategory: getCategoryMock,
  createCategory: createCategoryMock,
  updateCategory: updateCategoryMock,
  deleteCategory: deleteCategoryMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token"
  })
}));

describe("ProductCategoriesPage", () => {
  const departments = [
    { id: 10, code: "BAG", name: "Bags" },
    { id: 11, code: "SHO", name: "Shoes" }
  ];

  const firstPage = {
    items: [
      {
        id: 1,
        department_id: 10,
        product_department_id: 10,
        name: "Backpack"
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
    listProductDepartmentsMock.mockReset();
    listCategoriesPageMock.mockReset();
    getCategoryMock.mockReset();
    createCategoryMock.mockReset();
    updateCategoryMock.mockReset();
    deleteCategoryMock.mockReset();

    listProductDepartmentsMock.mockResolvedValue(departments);
    listCategoriesPageMock.mockResolvedValue(firstPage);
  });

  it("loads categories list with department filter control", async () => {
    const user = userEvent.setup();

    render(<ProductCategoriesPage />);

    await screen.findByRole("heading", { name: "Product Categories" });

    await user.selectOptions(screen.getByLabelText("Department"), "11");

    await waitFor(() => {
      expect(listCategoriesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        department_id: 11,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("applies search query to categories request", async () => {
    const user = userEvent.setup();

    render(<ProductCategoriesPage />);

    await screen.findByRole("heading", { name: "Product Categories" });
    await user.type(screen.getByLabelText("Search"), "pack");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listCategoriesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        department_id: undefined,
        q: "pack",
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("creates a category from modal and refreshes list", async () => {
    createCategoryMock.mockResolvedValue({ id: 2, department_id: 10, product_department_id: 10, name: "Duffel" });

    const user = userEvent.setup();

    render(<ProductCategoriesPage />);

    await screen.findByRole("heading", { name: "Product Categories" });

    await user.click(screen.getByRole("button", { name: "Add Category" }));
    expect(screen.getByRole("heading", { name: "Create Category" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Product Department"), "10");
    await user.type(screen.getByLabelText("Category Name"), "Duffel");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createCategoryMock).toHaveBeenCalledWith("Bearer test-token", {
        department_id: 10,
        name: "Duffel"
      });
    });

    expect(listCategoriesPageMock).toHaveBeenCalledTimes(2);
  });

  it("edits a category from row action", async () => {
    getCategoryMock.mockResolvedValue({ id: 1, department_id: 10, product_department_id: 10, name: "Backpack" });
    updateCategoryMock.mockResolvedValue({ id: 1, department_id: 11, product_department_id: 11, name: "Sneakers" });

    const user = userEvent.setup();

    render(<ProductCategoriesPage />);

    await screen.findByText("Backpack");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getCategoryMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    expect(screen.getByRole("heading", { name: "Edit Category" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Product Department"), "11");
    await user.clear(screen.getByLabelText("Category Name"));
    await user.type(screen.getByLabelText("Category Name"), "Sneakers");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateCategoryMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        department_id: 11,
        name: "Sneakers"
      });
    });
  });

  it("handles delete confirmation branches", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    deleteCategoryMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ProductCategoriesPage />);

    await screen.findByText("Backpack");

    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteCategoryMock).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteCategoryMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });
  });

  it("shows error state when initial request fails", async () => {
    listCategoriesPageMock.mockReset();
    listCategoriesPageMock.mockRejectedValue(new Error("Network error"));

    render(<ProductCategoriesPage />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });
});
