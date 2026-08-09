import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductTypesPage } from "./ProductTypesPage";

const {
  listProductDepartmentsMock,
  listCategoriesMock,
  listSubCategoriesMock,
  listProductTypesPageMock,
  getProductTypeMock,
  createProductTypeMock,
  updateProductTypeMock,
  deleteProductTypeMock
} = vi.hoisted(() => ({
  listProductDepartmentsMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  listSubCategoriesMock: vi.fn(),
  listProductTypesPageMock: vi.fn(),
  getProductTypeMock: vi.fn(),
  createProductTypeMock: vi.fn(),
  updateProductTypeMock: vi.fn(),
  deleteProductTypeMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  listProductDepartments: listProductDepartmentsMock,
  listCategories: listCategoriesMock,
  listSubCategories: listSubCategoriesMock,
  listProductTypesPage: listProductTypesPageMock,
  getProductType: getProductTypeMock,
  createProductType: createProductTypeMock,
  updateProductType: updateProductTypeMock,
  deleteProductType: deleteProductTypeMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token"
  })
}));

describe("ProductTypesPage", () => {
  const departments = [{ id: 10, code: "BAG", name: "Bags" }];
  const categories = [{ id: 21, department_id: 10, product_department_id: 10, name: "Travel" }];
  const subCategories = [{ id: 31, category_id: 21, name: "Backpack" }];
  const firstPage = {
    items: [{ id: 41, sub_category_id: 31, name: "Laptop Backpack" }],
    meta: { page: 1, per_page: 20, total_count: 1, total_pages: 1 }
  };

  beforeEach(() => {
    listProductDepartmentsMock.mockReset();
    listCategoriesMock.mockReset();
    listSubCategoriesMock.mockReset();
    listProductTypesPageMock.mockReset();
    getProductTypeMock.mockReset();
    createProductTypeMock.mockReset();
    updateProductTypeMock.mockReset();
    deleteProductTypeMock.mockReset();

    listProductDepartmentsMock.mockResolvedValue(departments);
    listCategoriesMock.mockResolvedValue(categories);
    listSubCategoriesMock.mockResolvedValue(subCategories);
    listProductTypesPageMock.mockResolvedValue(firstPage);
  });

  it("filters by sub category", async () => {
    const user = userEvent.setup();

    render(<ProductTypesPage />);

    await screen.findByRole("heading", { name: "Product Types" });
    await user.selectOptions(screen.getByLabelText("Sub Category"), "31");

    await waitFor(() => {
      expect(listProductTypesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        sub_category_id: 31,
        q: undefined,
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("creates product type", async () => {
    createProductTypeMock.mockResolvedValue({ id: 42, sub_category_id: 31, name: "Travel Backpack" });
    const user = userEvent.setup();

    render(<ProductTypesPage />);

    await screen.findByRole("heading", { name: "Product Types" });

    await user.click(screen.getByRole("button", { name: "Add Product Type" }));
    expect(screen.getByRole("heading", { name: "Create Product Type" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText("Sub Category (Form)")).toBeInTheDocument();
    });
    await user.selectOptions(screen.getByLabelText("Sub Category (Form)"), "31");
    await user.type(screen.getByLabelText("Product Type Name"), "Travel Backpack");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createProductTypeMock).toHaveBeenCalledWith("Bearer test-token", {
        sub_category_id: 31,
        name: "Travel Backpack"
      });
    });
  });

  it("edits product type", async () => {
    getProductTypeMock.mockResolvedValue({ id: 41, sub_category_id: 31, name: "Laptop Backpack" });
    updateProductTypeMock.mockResolvedValue({ id: 41, sub_category_id: 31, name: "Office Backpack" });
    const user = userEvent.setup();

    render(<ProductTypesPage />);

    await screen.findByText("Laptop Backpack");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getProductTypeMock).toHaveBeenCalledWith("Bearer test-token", 41);
    });

    await user.clear(screen.getByLabelText("Product Type Name"));
    await user.type(screen.getByLabelText("Product Type Name"), "Office Backpack");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateProductTypeMock).toHaveBeenCalledWith("Bearer test-token", 41, {
        sub_category_id: 31,
        name: "Office Backpack"
      });
    });
  });

  it("deletes product type with confirm", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    deleteProductTypeMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ProductTypesPage />);

    await screen.findByText("Laptop Backpack");

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteProductTypeMock).toHaveBeenCalledWith("Bearer test-token", 41);
    });
  });

  it("shows error state", async () => {
    listProductTypesPageMock.mockReset();
    listProductTypesPageMock.mockRejectedValue(new Error("Network error"));

    render(<ProductTypesPage />);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });
});
