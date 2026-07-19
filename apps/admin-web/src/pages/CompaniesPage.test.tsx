import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompaniesPage } from "./CompaniesPage";

const {
  listCompaniesPageMock,
  listCompanyMarketplaceLinksMock,
  getCompanyMock,
  createCompanyMock,
  updateCompanyMock,
  deleteCompanyMock,
  createCompanyMarketplaceLinkMock,
  updateCompanyMarketplaceLinkMock,
  deleteCompanyMarketplaceLinkMock
} = vi.hoisted(() => ({
  listCompaniesPageMock: vi.fn(),
  listCompanyMarketplaceLinksMock: vi.fn(),
  getCompanyMock: vi.fn(),
  createCompanyMock: vi.fn(),
  updateCompanyMock: vi.fn(),
  deleteCompanyMock: vi.fn(),
  createCompanyMarketplaceLinkMock: vi.fn(),
  updateCompanyMarketplaceLinkMock: vi.fn(),
  deleteCompanyMarketplaceLinkMock: vi.fn()
}));

vi.mock("../lib/api", () => ({
  API_BASE_URL: "http://localhost:3000",
  ApiError: class ApiError extends Error {
    details?: string[];
  },
  listCompaniesPage: listCompaniesPageMock,
  listCompanyMarketplaceLinks: listCompanyMarketplaceLinksMock,
  getCompany: getCompanyMock,
  createCompany: createCompanyMock,
  updateCompany: updateCompanyMock,
  deleteCompany: deleteCompanyMock,
  createCompanyMarketplaceLink: createCompanyMarketplaceLinkMock,
  updateCompanyMarketplaceLink: updateCompanyMarketplaceLinkMock,
  deleteCompanyMarketplaceLink: deleteCompanyMarketplaceLinkMock
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    token: "Bearer test-token"
  })
}));

vi.mock("../components/CoordinateMapPicker", () => ({
  CoordinateMapPicker: () => <div>Map Picker</div>
}));

describe("CompaniesPage sorting", () => {
  const alphaCompany = {
    id: 1,
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
  };

  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:logo-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    listCompaniesPageMock.mockReset();
    listCompanyMarketplaceLinksMock.mockReset();
    getCompanyMock.mockReset();
    createCompanyMock.mockReset();
    updateCompanyMock.mockReset();
    deleteCompanyMock.mockReset();
    createCompanyMarketplaceLinkMock.mockReset();
    updateCompanyMarketplaceLinkMock.mockReset();
    deleteCompanyMarketplaceLinkMock.mockReset();

    listCompaniesPageMock.mockResolvedValue({
      items: [alphaCompany],
      meta: {
        page: 1,
        per_page: 20,
        total_count: 1,
        total_pages: 1
      }
    });

    listCompanyMarketplaceLinksMock.mockResolvedValue([]);
  });

  it("applies sorting controls to the paginated companies request", async () => {
    const user = userEvent.setup();

    render(<CompaniesPage />);

    await screen.findByRole("heading", { name: "Companies" });

    await user.selectOptions(screen.getByLabelText("Sort By"), "code");

    await waitFor(() => {
      expect(listCompaniesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        order_by: "code",
        order_dir: undefined
      });
    });

    await user.selectOptions(screen.getByLabelText("Direction"), "desc");

    await waitFor(() => {
      expect(listCompaniesPageMock).toHaveBeenNthCalledWith(3, "Bearer test-token", {
        page: 1,
        order_by: "code",
        order_dir: "desc"
      });
    });
  });

  it("applies search query to the paginated companies request", async () => {
    const user = userEvent.setup();

    render(<CompaniesPage />);

    await screen.findByRole("heading", { name: "Companies" });
    await user.type(screen.getByLabelText("Search"), "alpha");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(listCompaniesPageMock).toHaveBeenNthCalledWith(2, "Bearer test-token", {
        page: 1,
        q: "alpha",
        order_by: undefined,
        order_dir: undefined
      });
    });
  });

  it("shows validation for non-individual company without required fields", async () => {
    const user = userEvent.setup();
    render(<CompaniesPage />);

    await screen.findByRole("heading", { name: "Companies" });
    await user.click(screen.getByRole("button", { name: "Add Company" }));
    await user.selectOptions(screen.getByLabelText("Company Type"), "pt");

    await user.type(screen.getByLabelText("Code"), "BETA");
    await user.type(screen.getByLabelText("Name"), "Beta Store");
    await user.type(screen.getByLabelText("Owner Name"), "Owner Beta");
    await user.type(screen.getByLabelText("Email"), "beta@example.com");
    await user.type(screen.getByLabelText("Phone"), "+620001");
    const form = screen.getByRole("button", { name: "Save" }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(
      await screen.findByText("Company registration number and NIB are required for CV/PT companies.")
    ).toBeInTheDocument();
    expect(createCompanyMock).not.toHaveBeenCalled();
  });

  it("creates company from modal and refreshes list", async () => {
    createCompanyMock.mockResolvedValue({ ...alphaCompany, id: 2, code: "BETA", name: "Beta Store" });

    const user = userEvent.setup();
    render(<CompaniesPage />);

    await screen.findByRole("heading", { name: "Companies" });
    await user.click(screen.getByRole("button", { name: "Add Company" }));

    await user.type(screen.getByLabelText("Code"), "BETA");
    await user.type(screen.getByLabelText("Name"), "Beta Store");
    await user.type(screen.getByLabelText("Owner Name"), "Owner Beta");
    await user.type(screen.getByLabelText("Email"), "beta@example.com");
    await user.type(screen.getByLabelText("Phone"), "+620001");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(createCompanyMock).toHaveBeenCalledWith(
        "Bearer test-token",
        {
          code: "BETA",
          name: "Beta Store",
          owner_name: "Owner Beta",
          company_type: "individual",
          email: "beta@example.com",
          phone: "+620001",
          status: "active",
          website: undefined,
          description: undefined,
          address: undefined,
          province: undefined,
          city: undefined,
          postal_code: undefined,
          company_registration_number: undefined,
          nib: undefined,
          siup: undefined,
          deed_number: undefined,
          pkp_number: undefined
        },
        { logo: undefined }
      );
    });
  });

  it("edits and deletes company", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    getCompanyMock.mockResolvedValue(alphaCompany);
    updateCompanyMock.mockResolvedValue({ ...alphaCompany, city: "Jakarta" });
    deleteCompanyMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<CompaniesPage />);

    await screen.findByRole("heading", { name: "Companies" });
    await user.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(getCompanyMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    await user.type(screen.getByLabelText("Company Registration Number"), "REG-001");
    await user.type(screen.getByLabelText("NIB"), "NIB-001");
    await user.type(screen.getByLabelText("City"), "Jakarta");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateCompanyMock).toHaveBeenCalledWith(
        "Bearer test-token",
        1,
        expect.objectContaining({ city: "Jakarta" }),
        { logo: undefined }
      );
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(deleteCompanyMock).toHaveBeenCalledWith("Bearer test-token", 1);
    });

    confirmSpy.mockRestore();
  });

  it("handles marketplace link create, duplicate validation, update and delete", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    const existingLink = {
      id: 10,
      marketplace: "shopee",
      store_name: "Alpha Shop",
      store_url: "https://shop.example.com",
      is_active: true
    };

    listCompanyMarketplaceLinksMock.mockResolvedValue([existingLink]);
    createCompanyMarketplaceLinkMock.mockResolvedValue({
      id: 11,
      marketplace: "tokopedia",
      store_name: "Alpha Toko",
      store_url: "https://tokopedia.example.com",
      is_active: true
    });
    updateCompanyMarketplaceLinkMock.mockResolvedValue({
      ...existingLink,
      store_name: "Alpha Shop Updated"
    });
    deleteCompanyMarketplaceLinkMock.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<CompaniesPage />);

    await screen.findByText("Marketplace Links");
    await screen.findByText("Alpha Shop");

    await user.type(screen.getByLabelText("Store Name"), "Duplicate Name");
    await user.type(screen.getByLabelText("Store URL"), "https://duplicate.example.com");

    await user.click(screen.getByRole("button", { name: "Add Link" }));
    expect(await screen.findByText("Marketplace already exists for this company.")).toBeInTheDocument();
    expect(createCompanyMarketplaceLinkMock).not.toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText("Marketplace"), "tokopedia");
    await user.clear(screen.getByLabelText("Store Name"));
    await user.type(screen.getByLabelText("Store Name"), "Alpha Toko");
    await user.clear(screen.getByLabelText("Store URL"));
    await user.type(screen.getByLabelText("Store URL"), "https://tokopedia.example.com");
    await user.click(screen.getByRole("button", { name: "Add Link" }));

    await waitFor(() => {
      expect(createCompanyMarketplaceLinkMock).toHaveBeenCalledWith("Bearer test-token", 1, {
        marketplace: "tokopedia",
        store_name: "Alpha Toko",
        store_url: "https://tokopedia.example.com",
        is_active: true
      });
    });

    await user.click(screen.getAllByRole("button", { name: "Edit" })[1]);
    await user.clear(screen.getByLabelText("Store Name"));
    await user.type(screen.getByLabelText("Store Name"), "Alpha Shop Updated");
    await user.click(screen.getByRole("button", { name: "Update Link" }));

    await waitFor(() => {
      expect(updateCompanyMarketplaceLinkMock).toHaveBeenCalledWith("Bearer test-token", 1, 10, {
        store_name: "Alpha Shop Updated",
        store_url: "https://shop.example.com",
        is_active: true
      });
    });

    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);
    await waitFor(() => {
      expect(deleteCompanyMarketplaceLinkMock).toHaveBeenCalledWith("Bearer test-token", 1, 10);
    });

    confirmSpy.mockRestore();
  });

  it("renders business-only fields, logo preview, and coordinate clear flow", async () => {
    const user = userEvent.setup();

    render(<CompaniesPage />);
    await screen.findByRole("heading", { name: "Companies" });

    await user.click(screen.getByRole("button", { name: "Add Company" }));
    await user.selectOptions(screen.getByLabelText("Company Type"), "pt");

    await user.type(screen.getByLabelText("Company Registration Number"), "REG-123");
    await user.type(screen.getByLabelText("NIB"), "NIB-123");
    await user.type(screen.getByLabelText("SIUP"), "SIUP-123");
    await user.type(screen.getByLabelText("Deed Number"), "DEED-123");
    await user.type(screen.getByLabelText("PKP Number"), "PKP-123");

    const logoInput = screen.getByLabelText("Logo Upload") as HTMLInputElement;
    const file = new File(["img"], "logo.png", { type: "image/png" });
    await user.upload(logoInput, file);

    expect(await screen.findByText("Selected file preview")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear Coordinate" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("heading", { name: "Create Company" })).not.toBeInTheDocument();
  });
});