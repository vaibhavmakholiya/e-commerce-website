const http = require('http');
const app = require('../app');

let server;
const PORT = 5055; // Dedicated test port
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const customerToken = 'Bearer mock_jwt_token_usr_demo_8821';
const adminToken = 'Bearer mock_jwt_token_admin_root_001';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting NovaCart Backend REST API Automated Test Suite...\n');
  let passed = 0;
  let total = 0;

  const assert = (condition, description) => {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description}`);
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.success === true, 'GET /api/v1/health returns 200 OK');

    // 2. Product listing & pagination
    const products = await request('GET', '/products?page=1&limit=4');
    assert(
      products.status === 200 &&
      Array.isArray(products.body.data.products) &&
      products.body.data.pagination.page === 1,
      'GET /api/v1/products returns paginated products collection'
    );

    // 3. Product details
    const productId = products.body.data.products[0]._id || products.body.data.products[0].id;
    const singleProduct = await request('GET', `/products/${productId}`);
    assert(
      singleProduct.status === 200 && singleProduct.body.data.name,
      `GET /api/v1/products/${productId} returns product detail`
    );

    // 4. Categories list
    const categories = await request('GET', '/categories');
    assert(
      categories.status === 200 && Array.isArray(categories.body.data) && categories.body.data.length > 0,
      'GET /api/v1/categories returns categories array'
    );

    // 5. Unauthenticated request rejection (Zero Trust)
    const unauth = await request('GET', '/auth/me');
    assert(unauth.status === 401 && unauth.body.success === false, 'GET /api/v1/auth/me rejects missing token with 401');

    // 6. Authenticated customer request
    const authMe = await request('GET', '/auth/me', null, { Authorization: customerToken });
    assert(
      authMe.status === 200 && authMe.body.data.email === 'arjun.sharma@example.in',
      'GET /api/v1/auth/me returns verified customer profile'
    );

    // 7. Cart operations
    const cart = await request('POST', '/cart/items', { productId, quantity: 2 }, { Authorization: customerToken });
    assert(
      cart.status === 201 && cart.body.data.itemsCount >= 2,
      'POST /api/v1/cart/items adds item with verified server totals'
    );

    // 8. Coupon validation
    const coupon = await request('POST', '/coupons/validate', { code: 'WELCOME100', subtotal: 1000 });
    assert(
      coupon.status === 200 && coupon.body.data.discountAmount === 100,
      'POST /api/v1/coupons/validate calculates correct server-side discount'
    );

    // 9. Order placement
    const orderRes = await request(
      'POST',
      '/orders',
      {
        items: [{ id: productId, quantity: 1 }],
        shippingAddress: {
          fullName: 'Arjun Sharma',
          phone: '9876543210',
          street: 'Flat 402, Bellandur',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103'
        },
        paymentMethod: 'Razorpay UPI'
      },
      { Authorization: customerToken }
    );
    assert(
      orderRes.status === 201 && orderRes.body.data.orderNumber,
      'POST /api/v1/orders creates order snapshot with orderNumber'
    );

    const createdOrderId = orderRes.body.data._id || orderRes.body.data.id;

    // 10. Customer Order retrieval
    const orderFetch = await request('GET', `/orders/${createdOrderId}`, null, { Authorization: customerToken });
    assert(
      orderFetch.status === 200 && orderFetch.body.data.total > 0,
      'GET /api/v1/orders/:id retrieves order for owner customer'
    );

    // 11. Customer cross-order access denial (Zero Trust)
    const otherCustomerToken = 'Bearer mock_jwt_token_usr_other_9999';
    const forbiddenFetch = await request('GET', `/orders/${createdOrderId}`, null, { Authorization: otherCustomerToken });
    assert(
      forbiddenFetch.status === 403,
      'GET /api/v1/orders/:id rejects cross-customer order snooping with 403 Forbidden'
    );

    // 12. Admin route protection against standard customer
    const customerAdminAttempt = await request(
      'POST',
      '/admin/products',
      { name: 'Hack Attempt', price: 10 },
      { Authorization: customerToken }
    );
    assert(
      customerAdminAttempt.status === 403,
      'POST /api/v1/admin/products rejects non-admin customer with 403 Forbidden'
    );

    // 13. Admin route success for authorized administrator
    const adminProductCreate = await request(
      'POST',
      '/admin/products',
      {
        name: 'Admin Test Flagship Phone',
        SKU: 'SKU-TEST-' + Date.now(),
        description: 'Created through verified admin endpoint test',
        price: 49999,
        category: 'electronics',
        inventoryQuantity: 50,
        images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800']
      },
      { Authorization: adminToken }
    );
    assert(
      adminProductCreate.status === 201 && adminProductCreate.body.data.name,
      'POST /api/v1/admin/products allows verified administrator to create product'
    );

    console.log(`\n====================================================`);
    console.log(`📊 TEST SUITE SUMMARY: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log(`====================================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
};

server = app.listen(PORT, () => {
  runTests();
});
