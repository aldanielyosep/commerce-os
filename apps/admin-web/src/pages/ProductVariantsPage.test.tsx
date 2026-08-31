import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProductVariantsPage } from "./ProductVariantsPage";

const {
  getProductMock,
  listProductVariantsMock,
  createProductVariantMock,
  updateProductVariantMock,
  deleteProductVariantMock,
  updateProductVariantPriceMock,
  updateProductVariantStockMock
} = vi.hoisted(() => ({
  getProductMock: vi.fn(),
  listProductVariantsMock: vi.fn(),
  createProductVariantMock: vi.fn(),
  updateProductVariantMock: vi.fn(),
  deleteProductVariantMock: vi.fn(),
  updateProductVariantPriceMock: vi.fn(),
  updateProductVariantStockMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  getProduct: getProductMock,
  listProductVariants: listProductVariantsMock,
  createProductVariant: createProductVariantMock,
  updateProductVariant: updateProductVariantMock,
  deleteProductVariant: deleteProductVariantMock,
  updateProductVariantPrice: updateProductVariantPriceMock,
  updateProductVariantStock: updateProductVariantStockMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "Bearer test-token" })
}));

function renderProductVariantsPage() {
  return render(
    <MemoryRouter initialEntries={["/products/1/variants"]}>
      <Routes>
        <Route path="/products/:productId/variants" element={<ProductVariantsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductVariantsPage", () => {
  const product = {
    id: 1,
    company_id: 1,
    product_code: "P0000001",
    slug: "paper-bag-list-hitam",
    product_name: "Paper Bag List Hitam",
    department_id: 10,
    category_id: 20,
    sub_category_id: 30,
    product_type_id: 40,
    short_description: "Paper bag",
    description_richtext: { type: "doc", content: [] },
    description_html: null,
    description_text: "Paper bag",
    status: "draft" as const,
    images_count: 0
  };

  const variant = {
    id: 101,
    product_id: 1,
    company_id: 1,
    sku: "SKU-001",
    barcode: "BC-001",
    status: "draft" as const,
    current_price: 10500.5,
    current_stock: 10000,
    attributes: [
      { name: "ukuran", value: "M" },
      { name: "warna", value: "Putih" }
    ]
  };

  beforeEach(() => {
    getProductMock.mockReset();
    listProductVariantsMock.mockReset();
    createProductVariantMock.mockReset();
    updateProductVariantMock.mockReset();
    deleteProductVariantMock.mockReset();
    updateProductVariantPriceMock.mockReset();
    updateProductVariantStockMock.mockReset();

    getProductMock.mockResolvedValue(product);
    listProductVariantsMock.mockResolvedValue({
      items: [],
      meta: { page: 1, per_page: 50, total_count: 0, total_pages: 0 }
    });
    createProductVariantMock.mockResolvedValue(variant);
    updateProductVariantMock.mockResolvedValue(variant);
    deleteProductVariantMock.mockResolvedValue(undefined);
    updateProductVariantPriceMock.mockResolvedValue(variant);
    updateProductVariantStockMock.mockResolvedValue(variant);
  });

  it("opens the create modal when the variants list is empty", async () => {
    renderProductVariantsPage();

    await screen.findByText("No variants found for this product.");

    fireEvent.click(screen.getByRole("button", { name: "Add Variant" }));

    expect(screen.getByRole("heading", { name: "Create Variant" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "SKU-NEW" } });
    fireEvent.change(screen.getByLabelText("Barcode"), { target: { value: "BC-NEW" } });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "10.500,50" } });
    fireEvent.change(screen.getByLabelText("Stock"), { target: { value: "10.000" } });
    fireEvent.change(screen.getByLabelText("Attributes"), { target: { value: "ukuran:M;warna:Putih" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Variant" }));

    await waitFor(() => {
      expect(createProductVariantMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        sku: "SKU-NEW",
        barcode: "BC-NEW",
        status: "draft",
        current_price: 10500.5,
        current_stock: 10000,
        attributes: [
          { name: "ukuran", value: "M" },
          { name: "warna", value: "Putih" }
        ]
      });
    });
  });

  it("opens the edit modal with price and stock forms", async () => {
    const user = userEvent.setup();
    listProductVariantsMock.mockResolvedValue({
      items: [variant],
      meta: { page: 1, per_page: 50, total_count: 1, total_pages: 1 }
    });

    renderProductVariantsPage();

    await screen.findByText("SKU-001");
  expect(screen.getByText("10.500,50")).toBeInTheDocument();
  expect(screen.getByText("10.000")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("heading", { name: "Edit Variant" })).toBeInTheDocument();
    expect(screen.getByLabelText("SKU")).toHaveValue("SKU-001");
    expect(screen.getByLabelText("Barcode")).toHaveValue("BC-001");
  expect(screen.getByLabelText("Price")).toHaveValue("10.500,50");
  expect(screen.getByLabelText("Stock")).toHaveValue("10.000");
    expect(screen.getByText("Price History")).toBeInTheDocument();
    expect(screen.getByText("Stock Ledger")).toBeInTheDocument();
  });

  it("submits variant updates from the edit modal", async () => {
    listProductVariantsMock.mockResolvedValue({
      items: [variant],
      meta: { page: 1, per_page: 50, total_count: 1, total_pages: 1 }
    });

    renderProductVariantsPage();

    await screen.findByText("SKU-001");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "SKU-UPDATED" } });
    fireEvent.change(screen.getByLabelText("Attributes"), { target: { value: "ukuran:L;warna:Hitam" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(updateProductVariantMock).toHaveBeenCalledWith("Bearer test-token", 1, 101, {
        sku: "SKU-UPDATED",
        barcode: "BC-001",
        status: "draft",
        current_price: 10500.5,
        current_stock: 10000,
        attributes: [
          { name: "ukuran", value: "L" },
          { name: "warna", value: "Hitam" }
        ]
      });
    });
  });

  it("submits price and stock adjustments from the edit modal", async () => {
    const user = userEvent.setup();
    listProductVariantsMock.mockResolvedValue({
      items: [variant],
      meta: { page: 1, per_page: 50, total_count: 1, total_pages: 1 }
    });

    renderProductVariantsPage();

    await screen.findByText("SKU-001");
    await user.click(screen.getByRole("button", { name: "Edit" }));

    fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "1.200,50" } });
    fireEvent.change(screen.getAllByPlaceholderText("Reason")[0], { target: { value: "sale adjustment" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Price" }));

    await waitFor(() => {
      expect(updateProductVariantPriceMock).toHaveBeenCalledWith("Bearer test-token", 1, 101, {
        value: 1200.5,
        effective_from: expect.any(String),
        reason: "sale adjustment"
      });
    });

    fireEvent.change(screen.getByPlaceholderText("Delta"), { target: { value: "-2" } });
    fireEvent.change(screen.getByDisplayValue("Restock"), { target: { value: "sale" } });
    fireEvent.change(screen.getAllByPlaceholderText("Reason")[1], { target: { value: "sold online" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Stock" }));

    await waitFor(() => {
      expect(updateProductVariantStockMock).toHaveBeenCalledWith("Bearer test-token", 1, 101, {
        delta: -2,
        event_type: "sale",
        reason: "sold online"
      });
    });
  });

  it("handles delete confirmation branches", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    const user = userEvent.setup();
    listProductVariantsMock.mockResolvedValue({
      items: [variant],
      meta: { page: 1, per_page: 50, total_count: 1, total_pages: 1 }
    });

    renderProductVariantsPage();

    await screen.findByText("SKU-001");

    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteProductVariantMock).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteProductVariantMock).toHaveBeenCalledWith("Bearer test-token", 1, 101);
    });

    confirmSpy.mockRestore();
  });

  it("shows an error when the initial product request fails", async () => {
    getProductMock.mockRejectedValue(new Error("Unable to load variants"));

    renderProductVariantsPage();

    expect(await screen.findAllByText("Unable to load variants")).not.toHaveLength(0);
  });
});