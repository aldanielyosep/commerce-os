import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductSubCategoriesPage } from "./ProductSubCategoriesPage";

const {
  listProductDepartmentsMock,
  listCategoriesMock,
  listSubCategoriesPageMock,
  getSubCategoryMock,
  createSubCategoryMock,
  updateSubCategoryMock,
  deleteSubCategoryMock
} = vi.hoisted(() => ({
  listProductDepartmentsMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  listSubCategoriesPageMock: vi.fn(),
  getSubCategoryMock: vi.fn(),
  createSubCategoryMock: vi.fn(),
  updateSubCategoryMock: vi.fn(),
  deleteSubCategoryMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listProductDepartments: listProductDepartmentsMock,
  listCategories: listCategoriesMock,
  listSubCategoriesPage: listSubCategoriesPageMock,
  getSubCategory: getSubCategoryMock,
  createSubCategory: createSubCategoryMock,
  updateSubCategory: updateSubCategoryMock,
  deleteSubCategory: deleteSubCategoryMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token"
  })
}));

describe("ProductSubCategoriesPage", () => {
  const departments = [{ id: 10, code: "BAG", name: "Bags" }];
  const categories = [{ id: 21, department_id: 10, product_department_id: 10, name: "Travel" }];
  const firstPage = {
    items: [{ id: 31, category_id: 21, name: "Backpack" }],
    meta: { page: 1, per_page: 20, total_count: 1, total_pages: 1 }
  };

  beforeEach(() => {
    listProductDepartmentsMock.mockReset();
    listCategoriesMock.mockReset();
    listSubCategoriesPageMock.mockReset();
    getSubCategoryMock.mockReset();
    createSubCategoryMock.mockReset();
    updateSubCategoryMock.mockReset();
    deleteSubCategoryMock.mockReset();

    listProductDepartmentsMock.mockResolvedValue(departments);
    listCategoriesMock.mockResolvedValue(categories);
    listSubCategoriesPageMock.mockResolvedValue(firstPage);
  });

  it("filters by category", async () => {
    const user = userEvent.setup();

    render(<ProductSubCategoriesPage />);

    await screen.findByRole("heading", { name: "Product Sub Categories" });
    await user.selectOptions(screen.getByLabelText("Category"), "21");

    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        category_id: 21,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("creates sub category", async () => {
    createSubCategoryMock.mockResolvedValue({ id: 32, category_id: 21, name: "Duffel" });
    const user = userEvent.setup();

    render(<ProductSubCategoriesPage />);

    await screen.findByRole("heading", { name: "Product Sub Categories" });

    await user.click(screen.getByRole("button", { name: "Add Sub Category" }));
    expect(screen.getByRole("heading", { name: "Create Sub Category" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Category (Form)")).toBeInTheDocument();
    });
    await user.selectOptions(screen.getByLabelText("Category (Form)"), "21");
    await user.type(screen.getByLabelText("Sub Category Name"), "Duffel");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createSubCategoryMock).toHaveBeenCalledWith("Bearer test-token", {
        category_id: 21,
        name: "Duffel"
      });
    });
  });

  it("edits sub category", async () => {
    getSubCategoryMock.mockResolvedValue({ id: 31, category_id: 21, name: "Backpack" });
    updateSubCategoryMock.mockResolvedValue({ id: 31, category_id: 21, name: "Sling" });
    const user = userEvent.setup();

    render(<ProductSubCategoriesPage />);

    await screen.findByText("Backpack");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getSubCategoryMock).toHaveBeenCalledWith("Bearer test-token", 31);
    });

    await user.clear(screen.getByLabelText("Sub Category Name"));
    await user.type(screen.getByLabelText("Sub Category Name"), "Sling");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateSubCategoryMock).toHaveBeenCalledWith("Bearer test-token", 31, {
        category_id: 21,
        name: "Sling"
      });
    });
  });

  it("deletes sub category with confirm", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    deleteSubCategoryMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ProductSubCategoriesPage />);

    await screen.findByText("Backpack");

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteSubCategoryMock).toHaveBeenCalledWith("Bearer test-token", 31);
    });
  });

  it("shows error state", async () => {
    listSubCategoriesPageMock.mockReset();
    listSubCategoriesPageMock.mockRejectedValue(new Error("Network error"));

    render(<ProductSubCategoriesPage />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });

  it("applies search, sort, and reset filters", async () => {

    const user = userEvent.setup();
    render(<ProductSubCategoriesPage />);

    await screen.findByText("Backpack");

    await user.selectOptions(screen.getByLabelText("Sort By"), "created_at");
    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        category_id: undefined,
        q: undefined,
        order_by: "created_at",
        order_dir: undefined
      });
    });

    await user.selectOptions(screen.getByLabelText("Direction"), "desc");
    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        category_id: undefined,
        q: undefined,
        order_by: "created_at",
        order_dir: "desc"
      });
    });

    await user.type(screen.getByLabelText("Search"), "  duf  ");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        category_id: undefined,
        q: "duf",
        order_by: "created_at",
        order_dir: "desc"
      });
    });

    await user.selectOptions(screen.getByLabelText("Department"), "10");
    await user.selectOptions(screen.getByLabelText("Category"), "21");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        category_id: undefined,
        q: undefined,
        order_by: "created_at",
        order_dir: "desc"
      });
    });
  });

  it("navigates next and previous pages", async () => {
    listSubCategoriesPageMock.mockResolvedValue({
      items: [{ id: 31, category_id: 21, name: "Backpack" }],
      meta: { page: 1, per_page: 20, total_count: 2, total_pages: 2 }
    });

    const user = userEvent.setup();
    render(<ProductSubCategoriesPage />);

    await screen.findByText("Backpack");

    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 2,
        category_id: undefined,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });

    await user.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() => {
      expect(listSubCategoriesPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        category_id: undefined,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("does not delete when confirm is canceled", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    const user = userEvent.setup();

    render(<ProductSubCategoriesPage />);
    await screen.findByText("Backpack");

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteSubCategoryMock).not.toHaveBeenCalled();
  });

  it("shows submit error and stays in modal", async () => {
    createSubCategoryMock.mockRejectedValue(new Error("Create failed"));
    const user = userEvent.setup();

    render(<ProductSubCategoriesPage />);
    await screen.findByRole("heading", { name: "Product Sub Categories" });

    await user.click(screen.getByRole("button", { name: "Add Sub Category" }));
    await user.selectOptions(screen.getByLabelText("Category (Form)"), "21");
    await user.type(screen.getByLabelText("Sub Category Name"), "Duffel");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Create failed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create Sub Category" })).toBeInTheDocument();
  });
});
