import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ProductsPage } from "./ProductsPage";

const {
  listCompaniesMock,
  listProductDepartmentsMock,
  listCategoriesMock,
  listSubCategoriesMock,
  listProductTypesMock,
  listProductsPageMock,
  listProductImagesMock,
  createProductMock,
  getProductMock,
  updateProductMock,
  deleteProductMock,
  activateProductMock,
  deactivateProductMock,
  uploadProductImageMock,
  updateProductImageMock,
  deleteProductImageMock
} = vi.hoisted(() => ({
  listCompaniesMock: vi.fn(),
  listProductDepartmentsMock: vi.fn(),
  listCategoriesMock: vi.fn(),
  listSubCategoriesMock: vi.fn(),
  listProductTypesMock: vi.fn(),
  listProductsPageMock: vi.fn(),
  listProductImagesMock: vi.fn(),
  createProductMock: vi.fn(),
  getProductMock: vi.fn(),
  updateProductMock: vi.fn(),
  deleteProductMock: vi.fn(),
  activateProductMock: vi.fn(),
  deactivateProductMock: vi.fn(),
  uploadProductImageMock: vi.fn(),
  updateProductImageMock: vi.fn(),
  deleteProductImageMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  API_BASE_URL: "http://localhost:3000",
  ApiError: class ApiError extends Error {
    details?: string[];
  },
  listCompanies: listCompaniesMock,
  listProductDepartments: listProductDepartmentsMock,
  listCategories: listCategoriesMock,
  listSubCategories: listSubCategoriesMock,
  listProductTypes: listProductTypesMock,
  listProductsPage: listProductsPageMock,
  listProductImages: listProductImagesMock,
  createProduct: createProductMock,
  getProduct: getProductMock,
  updateProduct: updateProductMock,
  deleteProduct: deleteProductMock,
  activateProduct: activateProductMock,
  deactivateProduct: deactivateProductMock,
  uploadProductImage: uploadProductImageMock,
  updateProductImage: updateProductImageMock,
  deleteProductImage: deleteProductImageMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "Bearer test-token" })
}));

function renderProductsPage() {
  return render(
    <MemoryRouter>
      <ProductsPage />
    </MemoryRouter>
  );
}

describe("ProductsPage taxonomy form", () => {
  const sampleProduct = {
    id: 101,
    company_id: 1,
    product_code: "P0000101",
    slug: "city-backpack",
    product_name: "City Backpack",
    department_id: 10,
    category_id: 21,
    sub_category_id: 31,
    product_type_id: 41,
    short_description: "Daily backpack",
    description_richtext: { type: "doc", content: [] },
    description_html: null,
    description_text: "Daily backpack",
    status: "draft",
    images_count: 1
  };

  beforeEach(() => {
    listCompaniesMock.mockReset();
    listProductDepartmentsMock.mockReset();
    listCategoriesMock.mockReset();
    listSubCategoriesMock.mockReset();
    listProductTypesMock.mockReset();
    listProductsPageMock.mockReset();
    listProductImagesMock.mockReset();
    createProductMock.mockReset();
    getProductMock.mockReset();
    updateProductMock.mockReset();
    deleteProductMock.mockReset();
    activateProductMock.mockReset();
    deactivateProductMock.mockReset();
    uploadProductImageMock.mockReset();
    updateProductImageMock.mockReset();
    deleteProductImageMock.mockReset();

    listCompaniesMock.mockResolvedValue([
      { id: 1, name: "Alpha Co" },
      { id: 2, name: "Beta Co" }
    ]);

    listProductDepartmentsMock.mockResolvedValue([
      { id: 10, code: "BAG", name: "Bags" },
      { id: 11, code: "SHO", name: "Shoes" }
    ]);

    listCategoriesMock.mockResolvedValue([
      { id: 21, department_id: 10, name: "Travel Bag" }
    ]);

    listSubCategoriesMock.mockResolvedValue([
      { id: 31, category_id: 21, name: "Backpack" }
    ]);

    listProductTypesMock.mockResolvedValue([
      { id: 41, sub_category_id: 31, name: "Laptop Backpack" }
    ]);

    listProductsPageMock.mockResolvedValue({
      items: [sampleProduct],
      meta: { page: 1, per_page: 20, total_count: 0, total_pages: 0 }
    });

    listProductImagesMock.mockResolvedValue([
      {
        id: 501,
        product_id: 101,
        alt_text: "Main image",
        is_cover: false,
        position: 1,
        image_url: "https://example.com/image-1.png"
      }
    ]);

    createProductMock.mockResolvedValue({
      id: 100,
      company_id: 1,
      product_code: "P0000001",
      slug: "new-product",
      product_name: "New Product",
      department_id: 10,
      category_id: 21,
      sub_category_id: 31,
      product_type_id: 41,
      short_description: "A short desc",
      description_richtext: { type: "doc", content: [] },
      description_html: null,
      description_text: "",
      status: "draft",
      images_count: 0
    });
  });

  it("loads cascading taxonomy options and submits create payload", async () => {
    renderProductsPage();

    await screen.findByRole("heading", { name: "Products" });

    await waitFor(() => {
      expect(listProductDepartmentsMock).toHaveBeenCalledWith("Bearer test-token");
    });

    await waitFor(() => {
      expect(listCategoriesMock).toHaveBeenCalledWith("Bearer test-token", { department_id: 10 });
    });

    await waitFor(() => {
      expect(listSubCategoriesMock).toHaveBeenCalledWith("Bearer test-token", { category_id: 21 });
    });

    await waitFor(() => {
      expect(listProductTypesMock).toHaveBeenCalledWith("Bearer test-token", { sub_category_id: 31 });
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Product" }));

    expect(await screen.findByLabelText("Product Department")).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "BAG - Bags" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "Travel Bag" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "Backpack" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "Laptop Backpack" })).toBeInTheDocument();
    expect(screen.getByLabelText("Product Department")).toHaveValue("10");
    expect(screen.getByLabelText("Category")).toHaveValue("21");
    expect(screen.getByLabelText("Sub Category")).toHaveValue("31");
    expect(screen.getByLabelText("Product Type")).toHaveValue("41");

    fireEvent.change(screen.getByLabelText("Product Name"), { target: { value: "New Product" } });
    fireEvent.change(screen.getByLabelText("Short Description"), { target: { value: "A short desc" } });
    fireEvent.change(screen.getByLabelText("Description (text)"), { target: { value: "Longer description" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createProductMock).toHaveBeenCalledWith("Bearer test-token", {
        company_id: 1,
        product_name: "New Product",
        department_id: 10,
        category_id: 21,
        sub_category_id: 31,
        product_type_id: 41,
        short_description: "A short desc",
        description_richtext: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Longer description"
                }
              ]
            }
          ]
        },
        status: "draft"
      });
    });
  });

  it("applies filters and sorting query to list request", async () => {
    const user = userEvent.setup();

    renderProductsPage();

    await screen.findByRole("heading", { name: "Products" });
    await user.clear(screen.getByLabelText("Search"));
    await user.type(screen.getByLabelText("Search"), "city");
    await user.selectOptions(screen.getByLabelText("Status"), "draft");
    await user.selectOptions(screen.getByLabelText("Sort By"), "product_name");
    await user.selectOptions(screen.getByLabelText("Direction"), "asc");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listProductsPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        q: "city",
        status: "draft",
        order_by: "product_name",
        order_dir: "asc"
      });
    });
  });

  it("loads product for edit and submits update payload", async () => {
    const user = userEvent.setup();
    getProductMock.mockResolvedValue(sampleProduct);
    updateProductMock.mockResolvedValue({ ...sampleProduct, product_name: "City Backpack Updated" });

    renderProductsPage();

    await screen.findByText("P0000101");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getProductMock).toHaveBeenCalledWith("Bearer test-token", 101);
    });

    await user.clear(screen.getByLabelText("Product Name"));
    await user.type(screen.getByLabelText("Product Name"), "City Backpack Updated");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith("Bearer test-token", 101, expect.objectContaining({
        product_name: "City Backpack Updated",
        department_id: 10,
        category_id: 21,
        sub_category_id: 31,
        product_type_id: 41
      }));
    });
  });

  it("runs lifecycle and image actions", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    activateProductMock.mockResolvedValue({ ...sampleProduct, status: "active" });
    deleteProductMock.mockResolvedValue(undefined);
    updateProductImageMock.mockResolvedValue({
      id: 501,
      product_id: 101,
      alt_text: "Main image",
      is_cover: true,
      position: 1,
      image_url: "https://example.com/image-1.png"
    });
    deleteProductImageMock.mockResolvedValue(undefined);
    uploadProductImageMock.mockResolvedValue({
      id: 502,
      product_id: 101,
      alt_text: "Extra image",
      is_cover: false,
      position: 2,
      image_url: "https://example.com/image-2.png"
    });

    renderProductsPage();

    await screen.findByText("P0000101");

    await user.click(screen.getByRole("button", { name: "Activate" }));
    await waitFor(() => {
      expect(activateProductMock).toHaveBeenCalledWith("Bearer test-token", 101);
    });

    await user.click(screen.getByRole("button", { name: "Set Cover" }));
    await waitFor(() => {
      expect(updateProductImageMock).toHaveBeenCalledWith("Bearer test-token", 101, 501, { is_cover: true });
    });

    const file = new File(["abc"], "product.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Image"), {
      target: { files: [file] }
    });
    await user.type(screen.getByLabelText("Alt Text"), "Extra image");
    await user.selectOptions(screen.getByLabelText("Is Cover"), "no");
    await user.click(screen.getAllByRole("button", { name: "Reset" })[1]);

    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);
    await waitFor(() => {
      expect(deleteProductImageMock).toHaveBeenCalledWith("Bearer test-token", 101, 501);
    });

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await waitFor(() => {
      expect(deleteProductMock).toHaveBeenCalledWith("Bearer test-token", 101);
    });

    confirmSpy.mockRestore();
  });

  it("runs deactivate and reset filter paths", async () => {
    const user = userEvent.setup();
    deactivateProductMock.mockResolvedValue({ ...sampleProduct, status: "inactive" });
    listProductsPageMock.mockResolvedValue({
      items: [{ ...sampleProduct, status: "active" }],
      meta: { page: 1, per_page: 20, total_count: 1, total_pages: 1 }
    });

    renderProductsPage();

    await screen.findByText("P0000101");
    await user.click(screen.getByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expect(deactivateProductMock).toHaveBeenCalledWith("Bearer test-token", 101);
    });

    await user.type(screen.getByLabelText("Search"), "draft");
    await user.selectOptions(screen.getByLabelText("Status"), "inactive");
    await user.selectOptions(screen.getByLabelText("Sort By"), "product_code");
    await user.selectOptions(screen.getByLabelText("Direction"), "asc");
    await user.click(screen.getAllByRole("button", { name: "Reset" })[0]);

    await waitFor(() => {
      expect(listProductsPageMock).toHaveBeenLastCalledWith("Bearer test-token", {
        page: 1,
        q: undefined,
        status: undefined,
        order_by: "created_at",
        order_dir: "desc"
      });
    });
  });

  it("shows error when loading product for edit fails", async () => {
    const user = userEvent.setup();
    getProductMock.mockRejectedValue(new Error("Unable to load product details"));

    renderProductsPage();

    await screen.findByText("P0000101");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getProductMock).toHaveBeenCalledWith("Bearer test-token", 101);
    });

    expect(await screen.findByText("Unable to load product details")).toBeInTheDocument();
  });
});
