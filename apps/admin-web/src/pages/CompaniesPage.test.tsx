import { render, screen, waitFor } from "@testing-library/react";
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
  beforeEach(() => {
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
      items: [
        {
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
        }
      ],
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
});