import {
  createCategory,
  createProductDepartment,
  createProductType,
  createSubCategory,
  archiveDocument,
  assignEmployeeDepartment,
  ApiError,
  changeUserRole,
  createCompany,
  createCompanyMarketplaceLink,
  createDepartment,
  createEmployee,
  createUser,
  createUserCompanyAssignment,
  deleteCompany,
  deleteCompanyMarketplaceLink,
  deleteDepartment,
  deleteEmployee,
  deleteCategory,
  deleteProductDepartment,
  deleteProductType,
  deleteSubCategory,
  deleteUser,
  deleteUserCompanyAssignment,
  deleteProduct,
  deleteProductImage,
  disableUser,
  enableUser,
  getProduct,
  getCompany,
  getCategory,
  getDepartment,
  getDocumentDownloadUrl,
  getEmployee,
  getProductDepartment,
  getUser,
  getProductType,
  getSubCategory,
  listCompaniesPage,
  listCompanyMarketplaceLinks,
  listDepartmentsPage,
  listEmployeeDepartments,
  listEmployeeDocuments,
  listEmployeesPage,
  listCategories,
  listProductImages,
  listProducts,
  listProductsPage,
  listProductDepartments,
  listProductTypes,
  listPositionTimeline,
  listSalaryTimeline,
  listSubCategories,
  listUserCompanyAssignments,
  listUsersPage,
  refreshAccessToken,
  removeEmployeeDepartment,
  requestPasswordReset,
  resetUserPassword,
  restoreProduct,
  signIn,
  signOut,
  setRefreshSessionHandler,
  terminateEmployee,
  UNAUTHORIZED_EVENT
  ,
  updateCompany,
  updateCategory,
  updateCompanyMarketplaceLink,
  updateDepartment,
  updateEmployee,
  updateProductDepartment,
  updateProductType,
  updateSubCategory,
  updateProduct,
  updateProductImage,
  updateUser,
  activateProduct,
  createProduct,
  createProductVariant,
  deactivateProduct,
  deleteProductVariant,
  getProductVariant,
  listProductVariants,
  updateProductVariant,
  updateProductVariantPrice,
  updateProductVariantStock,
  uploadProductImage,
  uploadEmployeeDocument
} from "./api";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function okResponse<T>(data: T, meta?: Record<string, unknown>): Response {
  return jsonResponse({ success: true, data, meta }, 200);
}

describe("api refresh retry flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    setRefreshSessionHandler(null);
  });

  afterEach(() => {
    setRefreshSessionHandler(null);
  });

  it("retries the original request once with refreshed access token", async () => {
    const refreshHandler = vi.fn().mockResolvedValue({
      token: "Bearer refreshed-token",
      refresh_token: "new-refresh-token",
      refresh_token_expires_at: "2099-01-01T00:00:00Z",
      user: {
        id: 1,
        email: "admin@example.com",
        username: "admin",
        role: "admin",
        status: "active"
      }
    });

    localStorage.setItem("commerce_os_web_refresh_token", "stored-refresh-token");
    setRefreshSessionHandler(refreshHandler);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({ success: false, message: "Unauthorized", errors: ["expired"] }, 401)
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: true,
            data: [
              {
                id: 1,
                email: "admin@example.com",
                username: "admin",
                role: "admin",
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
          },
          200
        )
      );

    const result = await listUsersPage("Bearer stale-token", { page: 1, per_page: 20 });

    expect(refreshHandler).toHaveBeenCalledWith("stored-refresh-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: expect.objectContaining({ Authorization: "Bearer stale-token" })
    });
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      headers: expect.objectContaining({ Authorization: "Bearer refreshed-token" })
    });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total_count).toBe(1);
  });

  it("emits unauthorized and throws when refresh cannot recover the request", async () => {
    const refreshHandler = vi.fn().mockResolvedValue(null);
    setRefreshSessionHandler(refreshHandler);
    localStorage.setItem("commerce_os_web_refresh_token", "stored-refresh-token");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Unauthorized", errors: ["invalid token"] }, 401)
    );

    const unauthorizedListener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, unauthorizedListener);

    await expect(listUsersPage("Bearer stale-token", { page: 1 })).rejects.toBeInstanceOf(ApiError);

    expect(refreshHandler).toHaveBeenCalledWith("stored-refresh-token");
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    window.removeEventListener(UNAUTHORIZED_EVENT, unauthorizedListener);
  });

  it("covers auth session endpoints", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 1,
              email: "admin@example.com",
              username: "admin",
              role: "admin",
              status: "active",
              refresh_token: "refresh-1",
              refresh_token_expires_at: "2099-01-01T00:00:00Z"
            }
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer signin-token"
            }
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 1,
              email: "admin@example.com",
              username: "admin",
              role: "admin",
              status: "active",
              refresh_token: "refresh-2",
              refresh_token_expires_at: "2099-02-01T00:00:00Z"
            }
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer refreshed-token"
            }
          }
        )
      )
      .mockResolvedValueOnce(okResponse({ message: "Signed out" }));

    const signedIn = await signIn("admin@example.com", "Password123!");
    expect(signedIn.token).toBe("Bearer signin-token");

    const refreshed = await refreshAccessToken("refresh-1");
    expect(refreshed.refresh_token).toBe("refresh-2");

    await expect(signOut("Bearer signin-token")).resolves.toBeUndefined();
  });

  it("covers employee and department wrappers", async () => {
    const employeeRecord = {
      id: 10,
      employee_id: "EMP-010",
      full_name: "Alice",
      gender: "female",
      birth_date: "1990-01-01",
      join_date: "2024-01-01",
      status: "active",
      identity_number: "ID-10",
      phone_number: "+6201",
      city: "Jakarta",
      email: "alice@example.com",
      address: "Street",
      postal_code: "10110"
    } as const;

    const employeePayload = {
      full_name: "Alice",
      gender: "female" as const,
      birth_date: "1990-01-01",
      join_date: "2024-01-01",
      identity_number: "ID-10",
      phone_number: "+6201",
      email: "alice@example.com",
      address: "Street",
      city: "Jakarta",
      postal_code: "10110"
    };

    const department = { id: 5, code: "ENG", name: "Engineering" };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okResponse([employeeRecord], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse(employeeRecord))
      .mockResolvedValueOnce(okResponse(employeeRecord))
      .mockResolvedValueOnce(okResponse(employeeRecord))
      .mockResolvedValueOnce(okResponse(employeeRecord))
      .mockResolvedValueOnce(okResponse({ id: 10, discarded: true }))
      .mockResolvedValueOnce(okResponse([{ id: 1, assigned_date: "2024-01-01", department }]))
      .mockResolvedValueOnce(okResponse({ id: 2, assigned_date: "2024-01-02", department }))
      .mockResolvedValueOnce(okResponse({ id: 2, discarded: true }))
      .mockResolvedValueOnce(okResponse([department], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse(department))
      .mockResolvedValueOnce(okResponse(department))
      .mockResolvedValueOnce(okResponse(department))
      .mockResolvedValueOnce(okResponse({ id: 5, discarded: true }));

    const employeePage = await listEmployeesPage("Bearer t", { page: 1, q: "ali", order_by: "full_name", order_dir: "asc" });
    expect(employeePage.items).toHaveLength(1);
    await expect(getEmployee("Bearer t", 10)).resolves.toMatchObject({ id: 10 });
    await expect(createEmployee("Bearer t", employeePayload)).resolves.toMatchObject({ id: 10 });
    await expect(updateEmployee("Bearer t", 10, { full_name: "Alice Updated" })).resolves.toMatchObject({ id: 10 });
    await expect(terminateEmployee("Bearer t", 10)).resolves.toMatchObject({ id: 10 });
    await expect(deleteEmployee("Bearer t", 10)).resolves.toBeUndefined();

    await expect(listEmployeeDepartments("Bearer t", 10)).resolves.toHaveLength(1);
    await expect(assignEmployeeDepartment("Bearer t", 10, { department_id: 5, assigned_date: "2024-01-02" })).resolves.toMatchObject({ id: 2 });
    await expect(removeEmployeeDepartment("Bearer t", 10, 2)).resolves.toBeUndefined();

    const departmentsPage = await listDepartmentsPage("Bearer t", { page: 1, q: "eng", order_by: "code", order_dir: "desc" });
    expect(departmentsPage.items).toHaveLength(1);
    await expect(getDepartment("Bearer t", 5)).resolves.toMatchObject({ id: 5 });
    await expect(createDepartment("Bearer t", department)).resolves.toMatchObject({ id: 5 });
    await expect(updateDepartment("Bearer t", 5, { name: "People Ops" })).resolves.toMatchObject({ id: 5 });
    await expect(deleteDepartment("Bearer t", 5)).resolves.toBeUndefined();
  });

  it("covers user and company wrappers", async () => {
    const userRecord = {
      id: 1,
      email: "admin@example.com",
      username: "admin",
      role: "admin",
      status: "active",
      employee_id: null,
      reset_password_sent_at: null
    };

    const company = {
      id: 9,
      code: "ALPHA",
      name: "Alpha",
      owner_name: "Owner",
      company_type: "pt",
      email: "alpha@example.com",
      phone: "+6200",
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

    const marketplaceLink = {
      id: 33,
      marketplace: "shopee",
      store_name: "Alpha Official",
      store_url: "https://shop.example.com",
      is_active: true
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okResponse([userRecord], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse(userRecord))
      .mockResolvedValueOnce(okResponse(userRecord))
      .mockResolvedValueOnce(okResponse(userRecord))
      .mockResolvedValueOnce(okResponse({ id: 1, deleted: true }))
      .mockResolvedValueOnce(okResponse(userRecord))
      .mockResolvedValueOnce(okResponse(userRecord))
      .mockResolvedValueOnce(okResponse(userRecord))
      .mockResolvedValueOnce(okResponse({ id: 1, reset_password_sent: true }))
      .mockResolvedValueOnce(okResponse([
        {
          id: 1,
          user_id: 1,
          company_id: 9,
          role_in_company: "manager",
          company: { id: 9, code: "ALPHA", name: "Alpha" }
        }
      ]))
      .mockResolvedValueOnce(okResponse({
        id: 2,
        user_id: 1,
        company_id: 9,
        role_in_company: "supervisor",
        company: { id: 9, code: "ALPHA", name: "Alpha" }
      }))
      .mockResolvedValueOnce(okResponse({ id: 2, discarded: true }))
      .mockResolvedValueOnce(okResponse([company], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse(company))
      .mockResolvedValueOnce(okResponse(company))
      .mockResolvedValueOnce(okResponse(company))
      .mockResolvedValueOnce(okResponse({ id: 9, discarded: true }))
      .mockResolvedValueOnce(okResponse([marketplaceLink]))
      .mockResolvedValueOnce(okResponse(marketplaceLink))
      .mockResolvedValueOnce(okResponse(marketplaceLink))
      .mockResolvedValueOnce(okResponse({ id: 33, discarded: true }))
      .mockResolvedValueOnce(okResponse({}));

    await expect(listUsersPage("Bearer t", { page: 1, q: "admin", order_by: "email", order_dir: "desc" })).resolves.toMatchObject({ items: [expect.objectContaining({ id: 1 })] });
    await expect(getUser("Bearer t", 1)).resolves.toMatchObject({ id: 1 });
    await expect(createUser("Bearer t", {
      email: "x@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      role: "admin",
      status: "active"
    })).resolves.toMatchObject({ id: 1 });
    await expect(updateUser("Bearer t", 1, { username: "next" })).resolves.toMatchObject({ id: 1 });
    await expect(deleteUser("Bearer t", 1)).resolves.toBeUndefined();
    await expect(enableUser("Bearer t", 1)).resolves.toMatchObject({ id: 1 });
    await expect(disableUser("Bearer t", 1)).resolves.toMatchObject({ id: 1 });
    await expect(changeUserRole("Bearer t", 1, "admin_company")).resolves.toMatchObject({ id: 1 });
    await expect(resetUserPassword("Bearer t", 1)).resolves.toBeUndefined();

    await expect(listUserCompanyAssignments("Bearer t", 1)).resolves.toHaveLength(1);
    await expect(createUserCompanyAssignment("Bearer t", 1, { company_id: 9, role_in_company: "supervisor" })).resolves.toMatchObject({ id: 2 });
    await expect(deleteUserCompanyAssignment("Bearer t", 1, 2)).resolves.toBeUndefined();

    const listPage = await listCompaniesPage("Bearer t", { page: 1, q: "alpha", order_by: "code", order_dir: "asc" });
    expect(listPage.items).toHaveLength(1);
    await expect(getCompany("Bearer t", 9)).resolves.toMatchObject({ id: 9 });

    const logoFile = new File(["abc"], "logo.png", { type: "image/png" });
    await expect(createCompany("Bearer t", {
      code: "ALPHA",
      name: "Alpha",
      owner_name: "Owner",
      company_type: "pt",
      email: "alpha@example.com",
      phone: "+6200",
      status: "active"
    }, { logo: logoFile })).resolves.toMatchObject({ id: 9 });
    await expect(updateCompany("Bearer t", 9, { city: "Jakarta" }, { remove_logo: true })).resolves.toMatchObject({ id: 9 });
    await expect(deleteCompany("Bearer t", 9)).resolves.toBeUndefined();

    await expect(listCompanyMarketplaceLinks("Bearer t", 9)).resolves.toHaveLength(1);
    await expect(createCompanyMarketplaceLink("Bearer t", 9, {
      marketplace: "shopee",
      store_name: "Alpha Official",
      store_url: "https://shop.example.com",
      is_active: true
    })).resolves.toMatchObject({ id: 33 });
    await expect(updateCompanyMarketplaceLink("Bearer t", 9, 33, {
      store_name: "Alpha Updated"
    })).resolves.toMatchObject({ id: 33 });
    await expect(deleteCompanyMarketplaceLink("Bearer t", 9, 33)).resolves.toBeUndefined();

    await expect(requestPasswordReset("admin@example.com")).resolves.toBeUndefined();
  });

  it("covers product taxonomy wrappers", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okResponse([{ id: 10, code: "BAG", name: "Bags" }], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse([{ id: 21, department_id: 10, product_department_id: 10, name: "Travel Bag" }], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse([{ id: 31, category_id: 21, name: "Backpack" }], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse([{ id: 41, sub_category_id: 31, name: "Laptop Backpack" }], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse({ id: 10, code: "BAG", name: "Bags" }))
      .mockResolvedValueOnce(okResponse({ id: 11, code: "ACC", name: "Accessories" }))
      .mockResolvedValueOnce(okResponse({ id: 11, code: "AC2", name: "Accessories 2" }))
      .mockResolvedValueOnce(okResponse({ id: 11, discarded: true }))
      .mockResolvedValueOnce(okResponse({ id: 21, department_id: 10, product_department_id: 10, name: "Travel Bag" }))
      .mockResolvedValueOnce(okResponse({ id: 22, department_id: 10, product_department_id: 10, name: "Duffel" }))
      .mockResolvedValueOnce(okResponse({ id: 22, department_id: 10, product_department_id: 10, name: "Duffel Updated" }))
      .mockResolvedValueOnce(okResponse({ id: 22, discarded: true }))
      .mockResolvedValueOnce(okResponse({ id: 31, category_id: 21, name: "Backpack" }))
      .mockResolvedValueOnce(okResponse({ id: 32, category_id: 21, name: "Sling" }))
      .mockResolvedValueOnce(okResponse({ id: 32, category_id: 21, name: "Sling Updated" }))
      .mockResolvedValueOnce(okResponse({ id: 32, discarded: true }))
      .mockResolvedValueOnce(okResponse({ id: 41, sub_category_id: 31, name: "Laptop Backpack" }))
      .mockResolvedValueOnce(okResponse({ id: 42, sub_category_id: 31, name: "Travel Backpack" }))
      .mockResolvedValueOnce(okResponse({ id: 42, sub_category_id: 31, name: "Travel Backpack Updated" }))
      .mockResolvedValueOnce(okResponse({ id: 42, discarded: true }));

    await expect(listProductDepartments("Bearer t")).resolves.toEqual([
      { id: 10, code: "BAG", name: "Bags" }
    ]);

    await expect(listCategories("Bearer t", { department_id: 10 })).resolves.toEqual([
      { id: 21, department_id: 10, product_department_id: 10, name: "Travel Bag" }
    ]);

    await expect(listSubCategories("Bearer t", { category_id: 21 })).resolves.toEqual([
      { id: 31, category_id: 21, name: "Backpack" }
    ]);

    await expect(listProductTypes("Bearer t", { sub_category_id: 31 })).resolves.toEqual([
      { id: 41, sub_category_id: 31, name: "Laptop Backpack" }
    ]);

    await expect(getProductDepartment("Bearer t", 10)).resolves.toMatchObject({ id: 10 });
    await expect(createProductDepartment("Bearer t", { code: "ACC", name: "Accessories" })).resolves.toMatchObject({ id: 11 });
    await expect(updateProductDepartment("Bearer t", 11, { code: "AC2" })).resolves.toMatchObject({ id: 11 });
    await expect(deleteProductDepartment("Bearer t", 11)).resolves.toBeUndefined();

    await expect(getCategory("Bearer t", 21)).resolves.toMatchObject({ id: 21 });
    await expect(createCategory("Bearer t", { department_id: 10, name: "Duffel" })).resolves.toMatchObject({ id: 22 });
    await expect(updateCategory("Bearer t", 22, { name: "Duffel Updated" })).resolves.toMatchObject({ id: 22 });
    await expect(deleteCategory("Bearer t", 22)).resolves.toBeUndefined();

    await expect(getSubCategory("Bearer t", 31)).resolves.toMatchObject({ id: 31 });
    await expect(createSubCategory("Bearer t", { category_id: 21, name: "Sling" })).resolves.toMatchObject({ id: 32 });
    await expect(updateSubCategory("Bearer t", 32, { name: "Sling Updated" })).resolves.toMatchObject({ id: 32 });
    await expect(deleteSubCategory("Bearer t", 32)).resolves.toBeUndefined();

    await expect(getProductType("Bearer t", 41)).resolves.toMatchObject({ id: 41 });
    await expect(createProductType("Bearer t", { sub_category_id: 31, name: "Travel Backpack" })).resolves.toMatchObject({ id: 42 });
    await expect(updateProductType("Bearer t", 42, { name: "Travel Backpack Updated" })).resolves.toMatchObject({ id: 42 });
    await expect(deleteProductType("Bearer t", 42)).resolves.toBeUndefined();
  });

  it("covers product and product image wrappers", async () => {
    const product = {
      id: 77,
      company_id: 9,
      product_code: "P0000077",
      slug: "sample-product",
      product_name: "Sample Product",
      department_id: 10,
      category_id: 21,
      sub_category_id: 31,
      product_type_id: 41,
      short_description: "Sample",
      description_richtext: { type: "doc", content: [] },
      description_html: null,
      description_text: "",
      status: "draft",
      images_count: 0
    };

    const image = {
      id: 991,
      product_id: 77,
      alt_text: "main",
      is_cover: true,
      position: 1,
      image_url: "https://img.example.com/1.png"
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okResponse([product], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse([product], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse(product))
      .mockResolvedValueOnce(okResponse(product))
      .mockResolvedValueOnce(okResponse(product))
      .mockResolvedValueOnce(okResponse({ id: 77, discarded: true }))
      .mockResolvedValueOnce(okResponse(product))
      .mockResolvedValueOnce(okResponse(product))
      .mockResolvedValueOnce(okResponse(product))
      .mockResolvedValueOnce(okResponse([image]))
      .mockResolvedValueOnce(okResponse(image))
      .mockResolvedValueOnce(okResponse(image))
      .mockResolvedValueOnce(okResponse({ id: 991, discarded: true }));

    const page = await listProductsPage("Bearer t", {
      q: "sample",
      status: "draft",
      page: 1,
      per_page: 20,
      order_by: "created_at",
      order_dir: "desc"
    });
    expect(page.items).toHaveLength(1);

    await expect(listProducts("Bearer t", { status: "draft" })).resolves.toHaveLength(1);
    await expect(getProduct("Bearer t", 77)).resolves.toMatchObject({ id: 77 });
    await expect(createProduct("Bearer t", {
      company_id: 9,
      product_name: "Sample Product",
      department_id: 10,
      category_id: 21,
      sub_category_id: 31,
      product_type_id: 41,
      short_description: "Sample",
      description_richtext: { type: "doc", content: [] },
      status: "draft"
    })).resolves.toMatchObject({ id: 77 });
    await expect(updateProduct("Bearer t", 77, { product_name: "Updated Product" })).resolves.toMatchObject({ id: 77 });
    await expect(deleteProduct("Bearer t", 77)).resolves.toBeUndefined();
    await expect(restoreProduct("Bearer t", 77)).resolves.toMatchObject({ id: 77 });
    await expect(activateProduct("Bearer t", 77)).resolves.toMatchObject({ id: 77 });
    await expect(deactivateProduct("Bearer t", 77)).resolves.toMatchObject({ id: 77 });

    await expect(listProductImages("Bearer t", 77)).resolves.toHaveLength(1);
    await expect(uploadProductImage("Bearer t", 77, {
      image: new File(["abc"], "product.png", { type: "image/png" }),
      alt_text: "main",
      is_cover: true,
      position: 1
    })).resolves.toMatchObject({ id: 991 });
    await expect(updateProductImage("Bearer t", 77, 991, { alt_text: "updated" })).resolves.toMatchObject({ id: 991 });
    await expect(deleteProductImage("Bearer t", 77, 991)).resolves.toBeUndefined();
  });

  it("covers product variant wrappers", async () => {
    const variant = {
      id: 11,
      product_id: 77,
      company_id: 9,
      sku: "SKU-001",
      barcode: "BC-001",
      status: "active",
      current_price: "990.00",
      current_stock: 50,
      attributes: [{ name: "ukuran", value: "M" }, { name: "warna", value: "Putih" }],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z"
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okResponse([variant], { page: 1, per_page: 20, total_count: 1, total_pages: 1 }))
      .mockResolvedValueOnce(okResponse(variant))
      .mockResolvedValueOnce(okResponse(variant))
      .mockResolvedValueOnce(okResponse(variant))
      .mockResolvedValueOnce(okResponse({ id: 11, discarded: true }))
      .mockResolvedValueOnce(okResponse(variant))
      .mockResolvedValueOnce(okResponse(variant));

    const page = await listProductVariants("Bearer t", 77, { page: 1, per_page: 20 });
    expect(page.items).toHaveLength(1);

    await expect(getProductVariant("Bearer t", 77, 11)).resolves.toMatchObject({ id: 11, sku: "SKU-001" });
    await expect(createProductVariant("Bearer t", 77, {
      sku: "SKU-001",
      barcode: "BC-001",
      status: "active",
      current_price: 990,
      current_stock: 50,
      attributes: [{ name: "ukuran", value: "M" }]
    })).resolves.toMatchObject({ id: 11 });
    await expect(updateProductVariant("Bearer t", 77, 11, {
      sku: "SKU-002",
      status: "inactive"
    })).resolves.toMatchObject({ id: 11 });
    await expect(deleteProductVariant("Bearer t", 77, 11)).resolves.toBeUndefined();
    await expect(updateProductVariantPrice("Bearer t", 77, 11, {
      value: 1200,
      effective_from: "2026-01-02T00:00:00Z",
      reason: "price adjustment"
    })).resolves.toMatchObject({ id: 11 });
    await expect(updateProductVariantStock("Bearer t", 77, 11, {
      delta: 10,
      event_type: "restock",
      reason: "purchase"
    })).resolves.toMatchObject({ id: 11 });
  });

  it("covers document and timeline wrappers", async () => {
    const doc = {
      id: 10,
      document_type: "passport",
      file_sequence: 1,
      notes: null,
      expiry_date: null,
      uploaded_by_id: 1,
      created_at: "2026-01-01T00:00:00Z",
      file_url: null
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(okResponse([{ id: 1, position: "Manager", effective_date: "2025-01-01", department_id: 5 }]))
      .mockResolvedValueOnce(okResponse([{ id: 1, basic_salary: 10000000, allowance: 0, bonus: 0, effective_date: "2025-01-01" }]))
      .mockResolvedValueOnce(okResponse([doc]))
      .mockResolvedValueOnce(okResponse(doc))
      .mockResolvedValueOnce(okResponse({ id: 10, url: "https://signed.example.com/file", expires_at: "2026-12-12T00:00:00Z" }))
      .mockResolvedValueOnce(okResponse({ id: 10, discarded: true }));

    await expect(listPositionTimeline("Bearer t", 10)).resolves.toHaveLength(1);
    await expect(listSalaryTimeline("Bearer t", 10)).resolves.toHaveLength(1);
    await expect(listEmployeeDocuments("Bearer t", 10)).resolves.toHaveLength(1);

    const uploadFile = new File(["doc"], "passport.pdf", { type: "application/pdf" });
    await expect(uploadEmployeeDocument("Bearer t", 10, {
      documentType: "passport",
      notes: "Important",
      expiryDate: "2028-01-01",
      file: uploadFile
    })).resolves.toMatchObject({ id: 10 });

    await expect(getDocumentDownloadUrl("Bearer t", 10, 10)).resolves.toMatchObject({
      url: "https://signed.example.com/file"
    });
    await expect(archiveDocument("Bearer t", 10, 10)).resolves.toBeUndefined();
  });

  it("throws ApiError when auth endpoints return invalid payload", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ success: false, message: "Unable to sign in", errors: ["invalid"] }, 401))
      .mockResolvedValueOnce(jsonResponse({ success: false, message: "Unable to refresh", errors: ["invalid"] }, 401));

    await expect(signIn("admin@example.com", "wrong")).rejects.toBeInstanceOf(ApiError);
    await expect(refreshAccessToken("bad")).rejects.toBeInstanceOf(ApiError);
  });
});