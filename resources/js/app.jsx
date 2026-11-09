import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const API = '/api';

let STORE_ID = 1;
let AUTH_TOKEN = localStorage.getItem('planbify_token') || '';

async function authenticatedRequest(url, options = {}) {
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
    };

    if (AUTH_TOKEN) {
        headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }

    return window.fetch(url, {
        ...options,
        headers
    });
}

function getImageUrl(image) {
    if (image.image_url) {
        return image.image_url;
    }

    if (image.image_path) {
        return `/storage/${image.image_path}`;
    }

    return '';
}

function Dashboard({ user, onLogout }) {
    const [activePage, setActivePage] = useState('Overview');

    const menuItems = [
        'Overview',
        'My Store',
        'Products',
        'Orders',
        'Customers',
        'Invoices',
        'Settings'
    ];

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="brand">
                    <h2>PlanBify</h2>
                    <span>STORE MANAGEMENT</span>
                </div>

                <p className="menu-heading">MENU</p>

                <nav>
                    {menuItems.map((item) => (
                        <button
                            key={item}
                            className={
                                activePage === item
                                    ? 'menu-item active'
                                    : 'menu-item'
                            }
                            onClick={() => setActivePage(item)}
                        >
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <p>PlanBify Store</p>
                    <span>Store Owner Panel</span>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <h2>{activePage}</h2>
                        <p>Welcome to your store management dashboard.</p>
                    </div>

                    <div className="profile">
                        <span>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>

                        <div>
                            <strong>{user?.name || 'Store Owner'}</strong>
                            <small>{user?.email || 'Administrator'}</small>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            style={{
                                marginLeft: '15px',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                background: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {activePage === 'Overview' && <Overview />}
                {activePage === 'My Store' && <MyStore />}
                {activePage === 'Products' && <Products />}
                {activePage === 'Orders' && <Orders />}
                {activePage === 'Customers' && <Customers />}
                {activePage === 'Invoices' && <Invoices />}

                {activePage === 'Settings' && <Settings />}
            </main>
        </div>
    );
}
function CreateStore({ user, onStoreCreated, onLogout }) {
    const [form, setForm] = useState({
        business_name: '',
        store_name: '',
        owner_name: user.name || '',
        email: user.email || '',
        phone: '',
        business_address: '',
        business_state: '',
        description: '',
        whatsapp_number: '',
        is_active: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authenticatedRequest(`${API}/stores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    Object.values(result.errors || {}).flat()[0] ||
                    'Unable to create store.'
                );
            }

            onStoreCreated(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f4f6f9',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '650px',
                margin: '0 auto',
                background: '#fff',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 5px 25px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ color: '#202b3c' }}>Create Your Store</h1>
                    <button type="button" onClick={onLogout}>
                        Logout
                    </button>
                </div>

                <p style={{ color: '#687386', marginBottom: '25px' }}>
                    Enter your business details to set up your online store.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Business Name *</label>
                        <input
                            name="business_name"
                            value={form.business_name}
                            onChange={handleChange}
                            placeholder="Enter business name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Store Name *</label>
                        <input
                            name="store_name"
                            value={form.store_name}
                            onChange={handleChange}
                            placeholder="Enter store name"
                            required
                        />
                        <small>
                            Your store URL will use this name.
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Owner Name *</label>
                        <input
                            name="owner_name"
                            value={form.owner_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                        />
                    </div>

                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <input
                            name="whatsapp_number"
                            value={form.whatsapp_number}
                            onChange={handleChange}
                            placeholder="Enter WhatsApp number"
                        />
                    </div>

                    <div className="form-group">
                        <label>Business Address</label>
                        <textarea
                            name="business_address"
                            value={form.business_address}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Enter business address"
                        />
                    </div>

                    <div className="form-group">
                        <label>Business State</label>
                        <input
                            name="business_state"
                            value={form.business_state}
                            onChange={handleChange}
                            placeholder="Example: Tamil Nadu"
                            maxLength="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Store Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Describe your business"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />
                            {' '}Activate store
                        </label>
                    </div>

                    {error && (
                        <p style={{ color: '#d32f2f' }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '15px' }}
                    >
                        {loading ? 'Creating Store...' : 'Create Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(AUTH_TOKEN));
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        if (!AUTH_TOKEN) {
            setLoading(false);
            return;
        }

        authenticatedRequest(`${API}/me`)
            .then(async (response) => {
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Session expired. Please log in again.');
                }

                setUser(result.user);

                if (result.user.stores?.length > 0) {
                    STORE_ID = result.user.stores[0].id;
                }
            })
            .catch(() => {
                AUTH_TOKEN = '';
                localStorage.removeItem('planbify_token');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (isRegister && form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const endpoint = isRegister ? 'register' : 'login';

            const response = await authenticatedRequest(`${API}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    Object.values(result.errors || {}).flat()[0] ||
                    'Authentication failed.'
                );
            }

            AUTH_TOKEN = result.token;
            localStorage.setItem('planbify_token', result.token);

            setUser(result.user);

            if (result.user.stores?.length > 0) {
                STORE_ID = result.user.stores[0].id;
            }
        } catch (err) {
            setError(err.message);
        }
    }

    function handleLogout() {
        authenticatedRequest(`${API}/logout`, {
            method: 'POST'
        }).catch(() => {});

        AUTH_TOKEN = '';
        localStorage.removeItem('planbify_token');
        setUser(null);
        setForm({
            name: '',
            email: '',
            password: '',
            password_confirmation: ''
        });
    }

    if (loading) {
        return <p style={{ padding: '40px' }}>Checking your account...</p>;
    }

    if (user && user.stores?.length > 0) {
        return <Dashboard user={user} onLogout={handleLogout} />;
    }

    if (user) {
        return (
            <CreateStore
                user={user}
                onLogout={handleLogout}
                onStoreCreated={(store) => {
                    STORE_ID = store.id;

                    setUser(previous => ({
                        ...previous,
                        stores: [...(previous.stores || []), store]
                    }));
                }}
            />
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#f4f6f9',
            padding: '20px'
        }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '35px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.08)'
                }}
            >
                <h1 style={{ color: '#202b3c', marginBottom: '5px' }}>
                    PlanBify
                </h1>

                <p style={{ color: '#687386', marginBottom: '25px' }}>
                    {isRegister ? 'Create your account' : 'Sign in to your store dashboard'}
                </p>

                {isRegister && (
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {isRegister && (
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                {error && (
                    <p style={{ color: '#d32f2f', fontSize: '14px' }}>
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="primary-button"
                    style={{ width: '100%', marginTop: '15px' }}
                >
                    {isRegister ? 'Create Account' : 'Login'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '22px' }}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    {' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                        style={{
                            border: 0,
                            background: 'none',
                            color: '#202b3c',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </button>
                </p>
            </form>
        </div>
    );
}

/* ---------------- OVERVIEW ---------------- */

function Overview() {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        customers: 0,
        invoices: 0
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadDashboardStats() {
            setLoading(true);
            setMessage('');

            try {
                const endpoints = [
                    'products',
                    'orders',
                    'customers',
                    'invoices'
                ];

                const results = await Promise.all(
                    endpoints.map(async (endpoint) => {
                        const response = await authenticatedRequest(
                            `${API}/stores/${STORE_ID}/${endpoint}`,
                            { headers: { Accept: 'application/json' } }
                        );

                        const result = await response.json();

                        if (!response.ok) {
                            throw new Error(
                                result.message || `Unable to load ${endpoint}.`
                            );
                        }

                        // The current Laravel APIs return their records in "data".
                        // This also supports APIs that return a plain array.
                        return Array.isArray(result)
                            ? result
                            : result.data || result.products ||
                              result.orders || result.customers ||
                              result.invoices || [];
                    })
                );

                setStats({
                    products: results[0].length,
                    orders: results[1].length,
                    customers: results[2].length,
                    invoices: results[3].length
                });
            } catch (error) {
                console.error('Dashboard statistics error:', error);
                setMessage(
                    error.message || 'Unable to load dashboard statistics.'
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboardStats();
    }, []);

    const statsCards = [
        { label: 'Total Products', value: stats.products },
        { label: 'Total Orders', value: stats.orders },
        { label: 'Total Customers', value: stats.customers },
        { label: 'Total Invoices', value: stats.invoices }
    ];

    return (
        <section>
            <div className="welcome-card">
                <h1>Welcome to PlanBify Store</h1>
                <p>
                    Manage your products, orders and business from one place.
                </p>
            </div>

            <h3 className="section-title">Store Overview</h3>

            {message && (
                <p role="status" style={{ color: '#b42318', marginBottom: '14px' }}>
                    {message}
                </p>
            )}

            <div className="stats-grid">
                {statsCards.map((item) => (
                    <div className="stat-card" key={item.label}>
                        <span>{item.label}</span>
                        <h2>{loading ? '...' : item.value}</h2>
                    </div>
                ))}
            </div>

            {!loading && (
                <p style={{ color: '#687386', fontSize: '13px', marginTop: '12px' }}>
                    Dashboard statistics are based on the current store records.
                </p>
            )}
        </section>
    );
}

/* ---------------- MY STORE ---------------- */

function MyStore() {
    const [store, setStore] = useState({
        business_name: '',
        store_name: '',
        owner_name: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        business_address: '',
        business_state: '',
        description: '',
        is_active: true
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authenticatedRequest(`${API}/stores/${STORE_ID}/manage`)
            .then((response) => response.json())
            .then((result) => {
                if (result.data) {
                    setStore((previous) => ({
                        ...previous,
                        ...result.data,
                        is_active: Boolean(result.data.is_active)
                    }));
                }
            })
            .catch(() => setMessage('Unable to load store details.'))
            .finally(() => setLoading(false));
    }, []);

    function handleChange(event) {
        const { name, value, checked, type } = event.target;

        setStore((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('Saving changes...');

        try {
            const response = await authenticatedRequest(`${API}/stores/${STORE_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(store)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to update store.'
                );
            }

            setMessage('Store details updated successfully!');
        } catch (error) {
            setMessage(error.message);
        }
    }

    if (loading) {
        return <p>Loading store details...</p>;
    }

    const fields = [
        ['business_name', 'Business Name'],
        ['store_name', 'Store Name'],
        ['owner_name', 'Owner Name'],
        ['email', 'Email'],
        ['phone', 'Phone'],
        ['whatsapp_number', 'WhatsApp Number'],
        ['business_state', 'Business State']
    ];

    return (
        <section className="placeholder-card">
            <h2>Store Details</h2>

            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>
                {fields.map(([name, label]) => (
                    <div className="form-group" key={name}>
                        <label>{label}</label>
                        <input
                            type={name === 'email' ? 'email' : 'text'}
                            name={name}
                            value={store[name] || ''}
                            onChange={handleChange}
                            required={[
                                'business_name',
                                'store_name',
                                'owner_name',
                                'email'
                            ].includes(name)}
                        />
                    </div>
                ))}

                <div className="form-group">
                    <label>Business Address</label>
                    <textarea
                        name="business_address"
                        value={store.business_address || ''}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={store.description || ''}
                        onChange={handleChange}
                    />
                </div>

                <label>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={store.is_active}
                        onChange={handleChange}
                    />
                    {' '}Enable Store
                </label>

                <br /><br />

                <button type="submit" className="primary-button">
                    Save Changes
                </button>
            </form>
        </section>
    );
}

/* ---------------- PRODUCTS ---------------- */

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categorySaving, setCategorySaving] = useState(false);

    const [categoryForm, setCategoryForm] = useState({
        category_name: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const emptyForm = {
        product_name: '',
        description: '',
        category_id: '',
        sku: '',
        price: '',
        discount_price: '',
        gst_percentage: '0',
        product_type: 'physical',
        stock_quantity: '0',
        is_available: true,
        is_active: true
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    // Load products and their images
    async function loadProducts() {
        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/products`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to load products.'
                );
            }

            const productList = result.data || [];

            // Retrieve images separately for each product
            const productsWithImages = await Promise.all(
                productList.map(async (product) => {
                    try {
                        const imageResponse = await authenticatedRequest(
                            `${API}/stores/${STORE_ID}/products/${product.id}/images`
                        );

                        const imageResult = await imageResponse.json();

                        return {
                            ...product,
                            images: imageResponse.ok
                                ? imageResult.data || []
                                : product.images || []
                        };
                    } catch {
                        return {
                            ...product,
                            images: product.images || []
                        };
                    }
                })
            );

            setProducts(productsWithImages);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadCategories() {
        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/categories`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to load categories.'
                );
            }

            setCategories(result.data || []);
        } catch (error) {
            setMessage(error.message);
        }
    }

    function openCategoryForm(category = null) {
        if (category) {
            setEditingCategoryId(category.id);
            setCategoryForm({
                category_name: category.category_name || '',
                description: category.description || ''
            });
        } else {
            setEditingCategoryId(null);
            setCategoryForm({ category_name: '', description: '' });
        }
        setShowCategoryForm(true);
        setMessage('');
    }

    function handleCategoryChange(event) {
        const { name, value } = event.target;
        setCategoryForm(previous => ({ ...previous, [name]: value }));
    }

    async function saveCategory(event) {
        event.preventDefault();
        setCategorySaving(true);
        setMessage('');
        try {
            const url = editingCategoryId
                ? `${API}/stores/${STORE_ID}/categories/${editingCategoryId}`
                : `${API}/stores/${STORE_ID}/categories`;
            const response = await authenticatedRequest(url, {
                method: editingCategoryId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(categoryForm)
            });
            const result = await response.json();
            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;
                throw new Error(validationMessage || 'Unable to save category.');
            }
            setMessage(editingCategoryId ? 'Category updated successfully!' : 'Category created successfully!');
            setShowCategoryForm(false);
            setEditingCategoryId(null);
            setCategoryForm({ category_name: '', description: '' });
            await loadCategories();
        } catch (error) {
            setMessage(error.message || 'Unable to save category.');
        } finally {
            setCategorySaving(false);
        }
    }

    async function deleteCategory(categoryId) {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        setMessage('');
        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/categories/${categoryId}`,
                { method: 'DELETE', headers: { Accept: 'application/json' } }
            );
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Unable to delete category.');
            setMessage('Category deleted successfully!');
            await loadCategories();
        } catch (error) {
            setMessage(error.message || 'Unable to delete category.');
        }
    }

    function handleChange(event) {
        const { name, value, checked, type } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    function openAddForm() {
        setForm(emptyForm);
        setEditingId(null);
        setSelectedImages([]);
        setShowForm(true);
        setMessage('');
    }

    function openEditForm(product) {
        setForm({
            product_name: product.product_name || '',
            description: product.description || '',
            category_id: product.category_id || '',
            sku: product.sku || '',
            price: product.price || '',
            discount_price: product.discount_price || '',
            gst_percentage: product.gst_percentage ?? '0',
            product_type: product.product_type || 'physical',
            stock_quantity: product.stock_quantity ?? '0',
            is_available: Boolean(product.is_available),
            is_active: Boolean(product.is_active)
        });

        setEditingId(product.id);
        setSelectedImages([]);
        setShowForm(true);
        setMessage('');
    }

    // Upload selected images to Laravel
    async function uploadProductImages(productId) {
        if (selectedImages.length === 0) {
            return;
        }

        const formData = new FormData();

        selectedImages.forEach((image) => {
            formData.append('images[]', image);
        });

        const response = await authenticatedRequest(
            `${API}/stores/${STORE_ID}/products/${productId}/images`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            const validationMessage = result.errors
                ? Object.values(result.errors).flat().join(' ')
                : result.message;

            throw new Error(
                validationMessage || 'Product image upload failed.'
            );
        }

        return result;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('Saving product...');

        const payload = {
            ...form,
            category_id: form.category_id
                ? Number(form.category_id)
                : null,
            price: Number(form.price),
            discount_price: form.discount_price === ''
                ? null
                : Number(form.discount_price),
            gst_percentage: Number(form.gst_percentage),
            stock_quantity: Number(form.stock_quantity),
            is_available: form.is_available,
            is_active: form.is_active
        };

        try {
            const url = editingId
                ? `${API}/stores/${STORE_ID}/products/${editingId}`
                : `${API}/stores/${STORE_ID}/products`;

            const response = await authenticatedRequest(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;

                throw new Error(
                    validationMessage || 'Unable to save product.'
                );
            }

            const productId = editingId || result.data?.id;

            // Upload images after the product has been saved
            if (productId && selectedImages.length > 0) {
                setUploading(true);
                await uploadProductImages(productId);
            }

            setMessage(
                selectedImages.length > 0
                    ? 'Product saved and images uploaded successfully!'
                    : editingId
                        ? 'Product updated successfully!'
                        : 'Product created successfully!'
            );

            setShowForm(false);
            setForm(emptyForm);
            setSelectedImages([]);
            setEditingId(null);

            await loadProducts();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setUploading(false);
        }
    }

    async function deleteProduct(productId) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this product?'
        );

        if (!confirmed) return;

        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/products/${productId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json'
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to delete product.'
                );
            }

            setMessage('Product deleted successfully!');
            await loadProducts();
        } catch (error) {
            setMessage(error.message);
        }
    }

    if (loading) {
        return <p>Loading products...</p>;
    }

    return (
        <section className="placeholder-card">
            {message && (
                <p style={{ marginBottom: '15px' }}>
                    {message}
                </p>
            )}

            <div className="product-heading">
                <div>
                    <h2>Product Management</h2>
                    <p>Manage your store products and services.</p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={openAddForm}
                >
                    + Add Product
                </button>
            </div>

            {/* CATEGORY MANAGEMENT */}
            <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fb', border: '1px solid #e1e5eb', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Category Management</h3>
                        <p style={{ color: '#687386', margin: '6px 0 0' }}>Organize your products and services into categories.</p>
                    </div>
                    <button type="button" className="primary-button" onClick={() => openCategoryForm()}>+ Add Category</button>
                </div>

                {showCategoryForm && (
                    <form onSubmit={saveCategory} style={{ marginTop: '20px', padding: '18px', background: '#ffffff', border: '1px solid #e1e5eb', borderRadius: '8px' }}>
                        <h4>{editingCategoryId ? 'Edit Category' : 'Create New Category'}</h4>
                        <div className="form-group">
                            <label>Category Name *</label>
                            <input name="category_name" value={categoryForm.category_name} onChange={handleCategoryChange} placeholder="Example: Electronics" maxLength="255" required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={categoryForm.description} onChange={handleCategoryChange} placeholder="Enter category description" rows="3" />
                        </div>
                        <button type="submit" className="primary-button" disabled={categorySaving}>
                            {categorySaving ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Save Category'}
                        </button>
                        <button type="button" className="secondary-button" onClick={() => { setShowCategoryForm(false); setEditingCategoryId(null); setCategoryForm({ category_name: '', description: '' }); }} style={{ marginLeft: '8px' }}>Cancel</button>
                    </form>
                )}

                <h4 style={{ marginTop: '22px' }}>Existing Categories ({categories.length})</h4>
                <div className="table-container">
                    <table>
                        <thead><tr><th>Category Name</th><th>Description</th><th>Actions</th></tr></thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr><td colSpan="3">No categories found. Add your first category.</td></tr>
                            ) : categories.map(category => (
                                <tr key={category.id}>
                                    <td>{category.category_name}</td>
                                    <td>{category.description || '-'}</td>
                                    <td>
                                        <button type="button" onClick={() => openCategoryForm(category)}>Edit</button>{' '}
                                        <button type="button" onClick={() => deleteCategory(category.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="product-form">
                    <h3>
                        {editingId ? 'Edit Product' : 'Add New Product'}
                    </h3>

                    <div className="form-group">
                        <label>Product Name</label>
                        <input
                            name="product_name"
                            value={form.product_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>SKU / Product Code</label>
                        <input
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Selling Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Discount Price (₹)</label>
                        <input
                            type="number"
                            name="discount_price"
                            min="0"
                            step="0.01"
                            value={form.discount_price}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>GST Percentage</label>
                        <input
                            type="number"
                            name="gst_percentage"
                            min="0"
                            max="100"
                            step="0.01"
                            value={form.gst_percentage}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Product Type</label>
                        <select
                            name="product_type"
                            value={form.product_type}
                            onChange={handleChange}
                        >
                            <option value="physical">
                                Physical Product
                            </option>
                            <option value="service">Service</option>
                        </select>
                    </div>

                    {form.product_type === 'physical' && (
                        <div className="form-group">
                            <label>Stock Quantity</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                min="0"
                                value={form.stock_quantity}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Product Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) => {
                                setSelectedImages(
                                    Array.from(event.target.files || [])
                                );
                            }}
                        />

                        {selectedImages.length > 0 && (
                            <p style={{ marginTop: '8px' }}>
                                {selectedImages.length} image(s) selected
                            </p>
                        )}

                        {selectedImages.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                    flexWrap: 'wrap',
                                    marginTop: '12px'
                                }}
                            >
                                {selectedImages.map((image, index) => (
                                    <img
                                        key={`${image.name}-${index}`}
                                        src={URL.createObjectURL(image)}
                                        alt={image.name}
                                        style={{
                                            width: '90px',
                                            height: '90px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_available"
                                checked={form.is_available}
                                onChange={handleChange}
                            />
                            {' '}Available
                        </label>
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />
                            {' '}Active Product
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={uploading}
                    >
                        {uploading
                            ? 'Uploading...'
                            : editingId
                                ? 'Update Product'
                                : 'Save Product'}
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                            setShowForm(false);
                            setSelectedImages([]);
                            setEditingId(null);
                        }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <h3 style={{ marginTop: '30px', marginBottom: '18px' }}>
                Existing Products ({products.length})
            </h3>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Discount</th>
                            <th>Stock</th>
                            <th>Type</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="10">No products found.</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        {product.images?.length > 0 ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '5px',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                {product.images.map((image) => (
                                                    <img
                                                        key={image.id}
                                                        src={getImageUrl(image)}
                                                        alt={product.product_name}
                                                        style={{
                                                            width: '55px',
                                                            height: '55px',
                                                            objectFit: 'cover',
                                                            borderRadius: '5px'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <span>No image</span>
                                        )}
                                    </td>

                                    <td>{product.product_name}</td>
                                    <td>{product.sku || '-'}</td>

                                    <td>
                                        {product.category?.category_name || '-'}
                                    </td>

                                    <td>
                                        ₹{Number(product.price).toFixed(2)}
                                    </td>

                                    <td>
                                        {product.discount_price
                                            ? `₹${Number(
                                                product.discount_price
                                            ).toFixed(2)}`
                                            : '-'}
                                    </td>

                                    <td>
                                        {product.product_type === 'physical'
                                            ? product.stock_quantity
                                            : '-'}
                                    </td>

                                    <td>{product.product_type}</td>

                                    <td>
                                        {product.is_available
                                            ? 'Available'
                                            : 'Unavailable'}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(product)}
                                        >
                                            Edit
                                        </button>

                                        {' '}

                                        <button
                                            type="button"
                                            onClick={() => deleteProduct(product.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

/* ---------------- ORDERS ---------------- */

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [savingStatus, setSavingStatus] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        setMessage('');
        try {
            const response = await authenticatedRequest(`${API}/stores/${STORE_ID}/orders`, {
                headers: { Accept: 'application/json' }
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Unable to load orders.');
            }
            const list = Array.isArray(result)
                ? result
                : result.data || result.orders || [];
            setOrders(list);
        } catch (error) {
            setMessage(error.message || 'Unable to load orders.');
        } finally {
            setLoading(false);
        }
    }

    async function viewOrder(orderId) {
        setMessage('');
        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/orders/${orderId}`,
                { headers: { Accept: 'application/json' } }
            );
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Unable to load order details.');
            }
            setSelectedOrder(result.order || result.data || result);
        } catch (error) {
            setMessage(error.message || 'Unable to load order details.');
        }
    }

    async function updateOrderStatus() {
        if (!selectedOrder) return;
        setSavingStatus(true);
        setMessage('');
        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/orders/${selectedOrder.id}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        order_status: selectedOrder.order_status,
                        payment_status: selectedOrder.payment_status
                    })
                }
            );
            const result = await response.json();
            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;
                throw new Error(validationMessage || 'Unable to update order status.');
            }
            const updated = result.order || result.data || {
                ...selectedOrder,
                ...(result)
            };
            setSelectedOrder(updated);
            setMessage('Order and payment statuses updated successfully.');
            await loadOrders();
        } catch (error) {
            setMessage(error.message || 'Unable to update order status.');
        } finally {
            setSavingStatus(false);
        }
    }

    const filteredOrders = orders.filter((order) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [
            order.order_number,
            order.customer_name,
            order.customer_phone
        ].some((value) => String(value || '').toLowerCase().includes(query));
        const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
    const inputStyle = {
        padding: '10px 12px',
        border: '1px solid #d8dce3',
        borderRadius: '7px',
        background: '#ffffff',
        minWidth: '180px'
    };

    if (loading) return <section className="placeholder-card"><p>Loading orders...</p></section>;

    return (
        <section className="placeholder-card">
            <div className="product-heading">
                <div>
                    <h2>Order Management</h2>
                    <p>View customer orders and manage order and payment status separately.</p>
                </div>
                <button type="button" className="primary-button" onClick={loadOrders}>Refresh Orders</button>
            </div>

            {message && <p role="status" style={{ margin: '14px 0', color: message.toLowerCase().includes('unable') ? '#b42318' : '#237a38' }}>{message}</p>}

            {selectedOrder ? (
                <div style={{ marginTop: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <h3>Order Details — {selectedOrder.order_number}</h3>
                        <button type="button" className="secondary-button" onClick={() => { setSelectedOrder(null); setMessage(''); }}>Back to Orders</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', margin: '16px 0' }}>
                        <div><strong>Customer</strong><p>{selectedOrder.customer_name}</p></div>
                        <div><strong>Mobile</strong><p>{selectedOrder.customer_phone}</p></div>
                        <div><strong>Email</strong><p>{selectedOrder.customer_email || '-'}</p></div>
                        <div><strong>Order Date</strong><p>{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '-'}</p></div>
                        <div><strong>Delivery Address</strong><p>{[selectedOrder.delivery_address, selectedOrder.city, selectedOrder.state, selectedOrder.pincode].filter(Boolean).join(', ')}</p></div>
                    </div>
                    <h3>Items</h3>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Product</th><th>Unit Price</th><th>Qty</th><th>Discount</th><th>GST</th><th>Line Total</th></tr></thead>
                            <tbody>
                                {(selectedOrder.items || []).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.product_name}</td>
                                        <td>{money(item.unit_price)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{money(item.discount_amount)}</td>
                                        <td>{money(item.gst_amount)}</td>
                                        <td>{money(item.line_total)}</td>
                                    </tr>
                                ))}
                                {(!selectedOrder.items || selectedOrder.items.length === 0) && <tr><td colSpan="6">No item details returned for this order.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ maxWidth: '420px', margin: '18px 0 24px auto', background: '#f7f6f3', padding: '16px', borderRadius: '8px' }}>
                        <p>Subtotal: <strong>{money(selectedOrder.subtotal)}</strong></p>
                        <p>Discount: <strong>{money(selectedOrder.discount_amount)}</strong></p>
                        {Number(selectedOrder.igst_amount || 0) > 0 ? (
                            <p>IGST: <strong>{money(selectedOrder.igst_amount)}</strong></p>
                        ) : (
                            <>
                                <p>CGST: <strong>{money(selectedOrder.cgst_amount)}</strong></p>
                                <p>SGST: <strong>{money(selectedOrder.sgst_amount)}</strong></p>
                            </>
                        )}
                        <p>Total GST: <strong>{money(selectedOrder.gst_amount)}</strong></p>
                        <p>Shipping: <strong>{money(selectedOrder.shipping_amount)}</strong></p>
                        <h3>Total: {money(selectedOrder.total_amount)}</h3>
                    </div>
                    <h3>Update Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', maxWidth: '620px' }}>
                        <div className="form-group">
                            <label>Order Status</label>
                            <select style={inputStyle} value={selectedOrder.order_status || 'pending'} onChange={(event) => setSelectedOrder((previous) => ({ ...previous, order_status: event.target.value }))}>
                                <option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Payment Status</label>
                            <select style={inputStyle} value={selectedOrder.payment_status || 'pending'} onChange={(event) => setSelectedOrder((previous) => ({ ...previous, payment_status: event.target.value }))}>
                                <option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                    <button type="button" className="primary-button" onClick={updateOrderStatus} disabled={savingStatus}>{savingStatus ? 'Saving...' : 'Save Status Changes'}</button>
                    <p style={{ color: '#687386', fontSize: '13px', marginTop: '10px' }}>Payment status is managed independently from order status. Select Paid only after confirming that payment was actually received.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '22px 0' }}>
                        <input style={inputStyle} type="search" placeholder="Search order, customer or mobile..." value={search} onChange={(event) => setSearch(event.target.value)} />
                        <select style={inputStyle} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">All Order Statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Order Number</th><th>Customer</th><th>Date</th><th>Amount</th><th>Order Status</th><th>Payment Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="7">No orders found.</td></tr>
                                ) : filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>{order.order_number}</td>
                                        <td>{order.customer_name}<br /><small>{order.customer_phone}</small></td>
                                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                                        <td>{money(order.total_amount)}</td>
                                        <td>{order.order_status}</td>
                                        <td>{order.payment_status}</td>
                                        <td><button type="button" onClick={() => viewOrder(order.id)}>View / Update</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ color: '#687386', fontSize: '13px', marginTop: '12px' }}>Showing {filteredOrders.length} of {orders.length} order(s).</p>
                </>
            )}
        </section>
    );
}



/* ---------------- CUSTOMERS ---------------- */

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setLoading(true);
        setMessage('');

        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/customers`,
                { headers: { Accept: 'application/json' } }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Unable to load customers.'
                );
            }

            setCustomers(result.data || []);
        } catch (error) {
            setMessage(error.message || 'Unable to load customers.');
        } finally {
            setLoading(false);
        }
    }

    const filteredCustomers = customers.filter((customer) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return [
            customer.customer_name,
            customer.customer_phone,
            customer.customer_email
        ].some((value) =>
            String(value || '').toLowerCase().includes(query)
        );
    });

    const money = (value) =>
        `₹${Number(value || 0).toFixed(2)}`;

    const date = (value) => {
        if (!value) return '-';

        const parsed = new Date(value);

        return Number.isNaN(parsed.getTime())
            ? value
            : parsed.toLocaleDateString();
    };

    if (loading) {
        return (
            <section className="placeholder-card">
                <p>Loading customers...</p>
            </section>
        );
    }

    return (
        <section className="placeholder-card">
            <div className="product-heading">
                <div>
                    <h2>Customer Management</h2>
                    <p>View your store customers and their purchase history.</p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={loadCustomers}
                >
                    Refresh Customers
                </button>
            </div>

            {message && (
                <p
                    role="status"
                    style={{ margin: '14px 0', color: '#b42318' }}
                >
                    {message}
                </p>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    margin: '22px 0'
                }}
            >
                <input
                    type="search"
                    placeholder="Search name, mobile or email..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #d8dce3',
                        borderRadius: '7px',
                        background: '#ffffff',
                        minWidth: '260px',
                        maxWidth: '100%'
                    }}
                />
                <span style={{ color: '#687386', fontSize: '13px' }}>
                    {filteredCustomers.length} customer(s)
                </span>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                            <th>Latest Order</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    {customers.length === 0
                                        ? 'No customers found for this store.'
                                        : 'No customers match your search.'}
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <strong>{customer.customer_name}</strong>
                                    </td>
                                    <td>{customer.customer_phone}</td>
                                    <td>{customer.customer_email || '-'}</td>
                                    <td>{customer.orders_count ?? 0}</td>
                                    <td>
                                        {money(customer.orders_sum_total_amount)}
                                    </td>
                                    <td>{date(customer.orders_max_created_at)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <p
                style={{
                    color: '#687386',
                    fontSize: '13px',
                    marginTop: '12px'
                }}
            >
                Showing {filteredCustomers.length} of {customers.length} customer(s).
            </p>
        </section>
    );
}

/* ---------------- INVOICES ---------------- */

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        loadInvoices();
    }, []);

    async function loadInvoices() {
        setLoading(true);
        setMessage('');

        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/invoices`,
                { headers: { Accept: 'application/json' } }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Unable to load invoices.');
            }

            const list = Array.isArray(result)
                ? result
                : result.data || result.invoices || [];

            setInvoices(list);
        } catch (error) {
            setMessage(error.message || 'Unable to load invoices.');
        } finally {
            setLoading(false);
        }
    }

    async function viewInvoice(invoiceId) {
        setMessage('');

        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/invoices/${invoiceId}`,
                { headers: { Accept: 'application/json' } }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Unable to load invoice details.');
            }

            setSelectedInvoice(result.invoice || result.data || result);
        } catch (error) {
            setMessage(error.message || 'Unable to load invoice details.');
        }
    }
        async function downloadInvoicePdf(invoiceId, invoiceNumber = 'invoice') {
        setMessage('');

        try {
            const response = await authenticatedRequest(
                `${API}/stores/${STORE_ID}/invoices/${invoiceId}/download`
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Unable to download invoice PDF.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoiceNumber}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            setMessage(error.message || 'PDF download failed.');
        }
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character]));
    }

    function printInvoice(invoice) {
        if (!invoice) return;

        const store = invoice.store || {};
        const order = invoice.order || {};
        const items = invoice.items || [];
        const printWindow = window.open('', '_blank', 'width=900,height=700');

        if (!printWindow) {
            setMessage('Please allow pop-ups to print the invoice.');
            return;
        }

        const rows = items.map(item => `
            <tr>
                <td>${escapeHtml(item.product_name)}</td>
                <td>${money(item.unit_price)}</td>
                <td>${escapeHtml(item.quantity)}</td>
                <td>${money(item.discount_amount)}</td>
                <td>${money(item.gst_amount)}</td>
                <td>${money(item.line_total)}</td>
            </tr>
        `).join('');
        const taxBreakdown = Number(invoice.igst_amount || 0) > 0
            ? `<p>IGST: <strong>${money(invoice.igst_amount)}</strong></p>`
            : `
                <p>CGST: <strong>${money(invoice.cgst_amount)}</strong></p>
                <p>SGST: <strong>${money(invoice.sgst_amount)}</strong></p>
            `;

        printWindow.document.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(invoice.invoice_number || 'Invoice')}</title>
<style>
    body{font-family:Arial,sans-serif;color:#202b3c;margin:36px}
    .top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #202b3c;padding-bottom:18px}
    h1{margin:0 0 8px;font-size:26px} h2{font-size:18px;margin:24px 0 10px}
    p{margin:5px 0;line-height:1.45}.muted{color:#687386;font-size:13px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{padding:10px;border:1px solid #d8dce3;text-align:left;font-size:13px}
    th{background:#f3f5f8}.totals{width:320px;margin:20px 0 0 auto}
    .grand{font-size:19px;font-weight:bold;border-top:2px solid #202b3c;padding-top:10px}
    @media print{body{margin:15mm}.no-print{display:none}}
</style></head><body>
    <div class="top"><div><h1>${escapeHtml(store.business_name || store.store_name || 'Invoice')}</h1>
    <p>${escapeHtml(store.business_address || '')}</p><p>${escapeHtml(store.email || '')} ${escapeHtml(store.phone || '')}</p>
    ${store.gstin ? `<p>GSTIN: ${escapeHtml(store.gstin)}</p>` : ''}</div>
    <div><h1>TAX INVOICE</h1><p><strong>Invoice:</strong> ${escapeHtml(invoice.invoice_number)}</p>
    <p><strong>Date:</strong> ${escapeHtml(invoice.invoice_date || '')}</p><p><strong>Payment:</strong> ${escapeHtml(invoice.payment_status || 'pending')}</p></div></div>
    <div class="meta"><div><h2>Bill To</h2><p><strong>${escapeHtml(order.customer_name || '')}</strong></p>
    <p>${escapeHtml(order.customer_phone || '')}</p><p>${escapeHtml(order.customer_email || '')}</p>
    <p>${escapeHtml([order.delivery_address, order.city, order.state, order.pincode].filter(Boolean).join(', '))}</p></div>
    <div><h2>Order Details</h2><p>Order: ${escapeHtml(order.order_number || '-')}</p></div></div>
    <h2>Items</h2><table><thead><tr><th>Product / Service</th><th>Unit Price</th><th>Qty</th><th>Discount</th><th>GST</th><th>Total</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">No invoice items</td></tr>'}</tbody></table>
    <div class="totals"><p>Subtotal: <strong>${money(invoice.subtotal)}</strong></p>
    <p>Discount: <strong>${money(invoice.discount_amount)}</strong></p>
    ${taxBreakdown}
    <p>Total GST: <strong>${money(invoice.gst_amount)}</strong></p>
    <p>Shipping: <strong>${money(invoice.shipping_amount)}</strong></p>
    <p class="grand">Total: ${money(invoice.total_amount)}</p></div>
    <p class="muted" style="margin-top:40px">Thank you for your business.</p>
    <script>window.onload=function(){window.focus();window.print();};<\/script>
</body></html>`);
        printWindow.document.close();
    }

    async function shareInvoiceWhatsApp(invoice) {
        if (!invoice) return;

        const order = invoice.order || {};
        const phone = String(order.customer_phone || '').replace(/\D/g, '');
        const messageText = [
            `Hello ${order.customer_name || 'Customer'},`,
            `Your invoice ${invoice.invoice_number || ''} is ready.`,
            `Total amount: ${money(invoice.total_amount)}`,
            `Payment status: ${invoice.payment_status || 'pending'}.`,
            'I am sharing the invoice PDF with this message.'
        ].join('\n');
        const whatsappUrl = phone
            ? `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`
            : `https://wa.me/?text=${encodeURIComponent(messageText)}`;

        // Open WhatsApp synchronously from the click to avoid popup blocking.
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        // WhatsApp cannot attach a locally downloaded PDF automatically.
        await downloadInvoicePdf(invoice.id, invoice.invoice_number || 'invoice');
        setMessage(
            phone
                ? 'Invoice PDF download started. Attach the downloaded PDF in the WhatsApp chat before sending.'
                : 'Customer mobile number is unavailable. WhatsApp opened with the invoice message; choose the recipient and attach the downloaded PDF.'
        );
    }

    const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
    const date = (value) => {
        if (!value) return '-';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
    };

    if (loading) {
        return (
            <section className="placeholder-card">
                <p>Loading invoices...</p>
            </section>
        );
    }

    return (
        <section className="placeholder-card">
            <div className="product-heading">
                <div>
                    <h2>Invoice Management</h2>
                    <p>View generated invoices and download customer PDF copies.</p>
                </div>
                <button
                    type="button"
                    className="primary-button"
                    onClick={loadInvoices}
                >
                    Refresh Invoices
                </button>
            </div>

            {message && (
                <p role="status" style={{ margin: '14px 0', color: '#b42318' }}>
                    {message}
                </p>
            )}

            {selectedInvoice ? (
                <div style={{ marginTop: '22px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <h3>Invoice Details — {selectedInvoice.invoice_number}</h3>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setSelectedInvoice(null)}
                        >
                            Back to Invoices
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                        gap: '14px',
                        margin: '16px 0'
                    }}>
                        <div><strong>Invoice Date</strong><p>{date(selectedInvoice.invoice_date)}</p></div>
                        <div><strong>Order Number</strong><p>{selectedInvoice.order?.order_number || '-'}</p></div>
                        <div><strong>Customer</strong><p>{selectedInvoice.order?.customer_name || '-'}</p></div>
                        <div><strong>Payment Status</strong><p>{selectedInvoice.payment_status || '-'}</p></div>
                    </div>

                    <h3>Invoice Items</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Unit Price</th>
                                    <th>Qty</th>
                                    <th>Discount</th>
                                    <th>GST</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedInvoice.items || []).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.product_name}</td>
                                        <td>{money(item.unit_price)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{money(item.discount_amount)}</td>
                                        <td>{money(item.gst_amount)}</td>
                                        <td>{money(item.line_total)}</td>
                                    </tr>
                                ))}
                                {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                                    <tr><td colSpan="6">No invoice items found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{
                        maxWidth: '420px',
                        margin: '18px 0 20px auto',
                        background: '#f7f6f3',
                        padding: '16px',
                        borderRadius: '8px'
                    }}>
                        <p>Subtotal: <strong>{money(selectedInvoice.subtotal)}</strong></p>
                        <p>Discount: <strong>{money(selectedInvoice.discount_amount)}</strong></p>
                        {Number(selectedInvoice.igst_amount || 0) > 0 ? (
                            <p>IGST: <strong>{money(selectedInvoice.igst_amount)}</strong></p>
                        ) : (
                            <>
                                <p>CGST: <strong>{money(selectedInvoice.cgst_amount)}</strong></p>
                                <p>SGST: <strong>{money(selectedInvoice.sgst_amount)}</strong></p>
                            </>
                        )}

                        <p>Total GST: <strong>{money(selectedInvoice.gst_amount)}</strong></p>
                        <p>Shipping: <strong>{money(selectedInvoice.shipping_amount)}</strong></p>
                        <h3>Total: {money(selectedInvoice.total_amount)}</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => downloadInvoicePdf(selectedInvoice.id, selectedInvoice.invoice_number)}
                        >
                            Download PDF
                        </button>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => printInvoice(selectedInvoice)}
                        >
                            Print Invoice
                        </button>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => shareInvoiceWhatsApp(selectedInvoice)}
                        >
                            Share via WhatsApp
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ marginTop: '22px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice Number</th>
                                    <th>Order Number</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Payment Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">No invoices have been generated yet.</td>
                                    </tr>
                                ) : invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>{invoice.invoice_number}</td>
                                        <td>{invoice.order?.order_number || '-'}</td>
                                        <td>{invoice.order?.customer_name || '-'}</td>
                                        <td>{date(invoice.invoice_date || invoice.created_at)}</td>
                                        <td>{money(invoice.total_amount)}</td>
                                        <td>{invoice.payment_status || 'pending'}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => viewInvoice(invoice.id)}
                                            >
                                                View
                                            </button>
                                            {' '}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    downloadInvoicePdf(
                                                        invoice.id,
                                                        invoice.invoice_number
                                                    )
                                                }
                                            >
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ color: '#687386', fontSize: '13px', marginTop: '12px' }}>
                        Showing {invoices.length} invoice(s).
                    </p>
                </>
            )}
        </section>
    );
}


/* ---------------- SETTINGS ---------------- */

function Settings() {
    const defaultSettings = {
        business_state: '',
        gstin: '',
        gst_registered: false,
        default_gst_percentage: '18',
        shipping_charge: '0',
        payment_method: 'cod',
        payment_instructions: ''
    };

    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setLoading(true);
        setMessage('');

        try {
            const response = await authenticatedRequest(`${API}/stores/${STORE_ID}/manage`, {
                headers: { Accept: 'application/json' }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Unable to load store settings.');
            }

            const store = result.data || result.store || result;

            setSettings({
                ...defaultSettings,
                business_state: store.business_state || '',
                gstin: store.gstin || '',
                gst_registered: Boolean(store.gst_registered),
                default_gst_percentage: String(store.default_gst_percentage ?? '18'),
                shipping_charge: String(store.shipping_charge ?? '0'),
                payment_method: store.payment_method || 'cod',
                payment_instructions: store.payment_instructions || ''
            });
        } catch (error) {
            setMessage(error.message || 'Unable to load settings.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    }

    function handleChange(event) {
        const { name, value, checked, type } = event.target;

        setSettings((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');

        if (!settings.business_state.trim()) {
            setMessage('Business State is required.');
            setMessageType('error');
            return;
        }

        setSaving(true);

        const payload = {
            business_state: settings.business_state.trim(),
            gstin: settings.gstin.trim() || null,
            gst_registered: settings.gst_registered,
            default_gst_percentage: Number(settings.default_gst_percentage),
            shipping_charge: Number(settings.shipping_charge),
            payment_method: settings.payment_method,
            payment_instructions: settings.payment_instructions.trim() || null
        };

        try {
            const response = await authenticatedRequest(`${API}/stores/${STORE_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;

                throw new Error(validationMessage || 'Unable to save settings.');
            }

            // Reflect the values returned by Laravel so the UI shows persisted data.
            const savedStore = result.data || {};
            setSettings((previous) => ({
                ...previous,
                business_state: savedStore.business_state ?? payload.business_state,
                gstin: savedStore.gstin ?? payload.gstin ?? '',
                gst_registered: Boolean(savedStore.gst_registered ?? payload.gst_registered),
                default_gst_percentage: String(savedStore.default_gst_percentage ?? payload.default_gst_percentage),
                shipping_charge: String(savedStore.shipping_charge ?? payload.shipping_charge),
                payment_method: savedStore.payment_method ?? payload.payment_method,
                payment_instructions: savedStore.payment_instructions ?? payload.payment_instructions ?? ''
            }));

            setMessage('Settings saved successfully!');
            setMessageType('success');
        } catch (error) {
            setMessage(error.message || 'Unable to save settings.');
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    }

    const fieldStyle = {
        width: '100%',
        maxWidth: '520px',
        padding: '11px 12px',
        border: '1px solid #d8dce3',
        borderRadius: '7px',
        background: '#ffffff',
        font: 'inherit'
    };

    const sectionStyle = {
        border: '1px solid #e5e8ee',
        borderRadius: '10px',
        padding: '22px',
        marginTop: '20px',
        background: '#ffffff'
    };

    if (loading) {
        return (
            <section className="placeholder-card">
                <p>Loading store settings...</p>
            </section>
        );
    }

    return (
        <section className="placeholder-card">
            <div className="product-heading">
                <div>
                    <h2>Store Settings</h2>
                    <p>Manage GST, shipping charges and accepted payment methods.</p>
                </div>
                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadSettings}
                >
                    Reload Settings
                </button>
            </div>

            {message && (
                <p
                    role="status"
                    style={{
                        margin: '16px 0',
                        color: messageType === 'error' ? '#b42318' : '#237a38'
                    }}
                >
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>GST Settings</h3>
                    <p style={{ color: '#687386', marginTop: '-5px' }}>
                        Configure the GST details used for your store transactions.
                    </p>

                    <div className="form-group">
                        <label htmlFor="settings-business-state">Business State *</label>
                        <input
                            id="settings-business-state"
                            style={fieldStyle}
                            name="business_state"
                            value={settings.business_state}
                            onChange={handleChange}
                            placeholder="Example: Tamil Nadu"
                            maxLength="100"
                            required
                        />
                        <small style={{ color: '#687386' }}>
                            Used to determine whether checkout GST is CGST + SGST or IGST.
                            Enter the full state name consistently.
                        </small>
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="gst_registered"
                                checked={settings.gst_registered}
                                onChange={handleChange}
                            />
                            {' '}My business is GST registered
                        </label>
                    </div>

                    {settings.gst_registered && (
                        <>
                            <div className="form-group">
                                <label htmlFor="settings-gstin">GSTIN</label>
                                <input
                                    id="settings-gstin"
                                    style={fieldStyle}
                                    name="gstin"
                                    value={settings.gstin}
                                    onChange={handleChange}
                                    maxLength="15"
                                    placeholder="Enter 15-character GSTIN"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="settings-gst-rate">Default GST Rate (%)</label>
                                <input
                                    id="settings-gst-rate"
                                    style={fieldStyle}
                                    type="number"
                                    name="default_gst_percentage"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={settings.default_gst_percentage}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}
                </div>

                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Shipping Settings</h3>
                    <p style={{ color: '#687386', marginTop: '-5px' }}>
                        Set the default shipping charge applied during checkout.
                    </p>

                    <div className="form-group">
                        <label htmlFor="settings-shipping">Default Shipping Charge (₹)</label>
                        <input
                            id="settings-shipping"
                            style={fieldStyle}
                            type="number"
                            name="shipping_charge"
                            min="0"
                            step="0.01"
                            value={settings.shipping_charge}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>Payment Settings</h3>
                    <p style={{ color: '#687386', marginTop: '-5px' }}>
                        Select the payment method currently supported by your store.
                    </p>

                    <div className="form-group">
                        <label htmlFor="settings-payment-method">Accepted Payment Method</label>
                        <select
                            id="settings-payment-method"
                            style={fieldStyle}
                            name="payment_method"
                            value={settings.payment_method}
                            onChange={handleChange}
                        >
                            <option value="cod">Cash on Delivery</option>
                            <option value="bank_transfer">Bank Transfer / UPI (manual)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="settings-payment-instructions">
                            Payment Instructions (optional)
                        </label>
                        <textarea
                            id="settings-payment-instructions"
                            style={{ ...fieldStyle, minHeight: '100px' }}
                            name="payment_instructions"
                            value={settings.payment_instructions}
                            onChange={handleChange}
                            placeholder="Enter bank or UPI payment instructions for customers."
                        />
                    </div>
                </div>

                <div style={{ marginTop: '22px' }}>
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                    >
                        {saving ? 'Saving Settings...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </section>
    );
}

function Storefront({ storeSlug }) {
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [orderConfirmation, setOrderConfirmation] = useState(null);
    const [checkoutForm, setCheckoutForm] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        delivery_address: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        let isMounted = true;

        async function loadStorefront() {
            try {
                setLoading(true);
                setError('');

                // Find the store that matches the slug in the public URL.
                const storeResponse = await authenticatedRequest(`${API}/stores`, {
                    headers: { Accept: 'application/json' }
                });

                const storeResult = await storeResponse.json();

                if (!storeResponse.ok) {
                    throw new Error(
                        storeResult.message || 'Unable to load store details.'
                    );
                }

                const storeList = Array.isArray(storeResult)
                    ? storeResult
                    : storeResult.data || [];

                const currentStore = storeList.find((item) =>
                    item.subdomain === storeSlug ||
                    item.slug === storeSlug
                );

                if (!currentStore) {
                    throw new Error('Store not found. Please check the store URL.');
                }

                if (!currentStore.is_active) {
                    throw new Error('This store is currently unavailable.');
                }

                if (isMounted) {
                    setStore(currentStore);
                }

                // Load only the products belonging to this store.
                const productResponse = await authenticatedRequest(
                    `${API}/stores/${currentStore.id}/products`,
                    { headers: { Accept: 'application/json' } }
                );

                const productResult = await productResponse.json();

                if (!productResponse.ok) {
                    throw new Error(
                        productResult.message || 'Unable to load products.'
                    );
                }

                const productList = Array.isArray(productResult)
                    ? productResult
                    : productResult.data || [];

                const activeProducts = productList.filter(
                    (product) =>
                        Boolean(product.is_active) &&
                        Boolean(product.is_available)
                );

                // Retrieve each product's gallery images.
                const productsWithImages = await Promise.all(
                    activeProducts.map(async (product) => {
                        try {
                            const imageResponse = await authenticatedRequest(
                                `${API}/stores/${currentStore.id}/products/${product.id}/images`,
                                { headers: { Accept: 'application/json' } }
                            );

                            if (!imageResponse.ok) {
                                return {
                                    ...product,
                                    images: product.images || []
                                };
                            }

                            const imageResult = await imageResponse.json();

                            return {
                                ...product,
                                images: Array.isArray(imageResult)
                                    ? imageResult
                                    : imageResult.data || []
                            };
                        } catch {
                            return {
                                ...product,
                                images: product.images || []
                            };
                        }
                    })
                );

                if (isMounted) {
                    setProducts(productsWithImages);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Something went wrong.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadStorefront();

        return () => {
            isMounted = false;
        };
    }, [storeSlug]);

    const storefrontImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        return `/storage/${path.replace(/^\/+/, '')}`;
    };

    const categories = [
        'All',
        ...new Set(
            products
                .map((product) => product.category?.category_name)
                .filter(Boolean)
        )
    ];

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.product_name
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory =
            selectedCategory === 'All' ||
            product.category?.category_name === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const cartItemCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartSubtotal = cart.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
    );

    function addToCart(product) {
        const availableStock = Number(product.stock_quantity);

        if (
            product.product_type === 'physical' &&
            availableStock <= 0
        ) {
            window.alert('This product is out of stock.');
            return;
        }

        setCart((previousCart) => {
            const existingItem = previousCart.find(
                (item) => item.id === product.id
            );

            if (existingItem) {
                if (
                    product.product_type === 'physical' &&
                    existingItem.quantity >= availableStock
                ) {
                    window.alert('You cannot add more than the available stock.');
                    return previousCart;
                }

                return previousCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [
                ...previousCart,
                {
                    ...product,
                    quantity: 1,
                    unitPrice: Number(
                        product.discount_price || product.price
                    )
                }
            ];
        });
    }

    function updateCartQuantity(productId, change) {
        setCart((previousCart) =>
            previousCart
                .map((item) => {
                    if (item.id !== productId) return item;

                    const nextQuantity = item.quantity + change;

                    if (nextQuantity < 1) return item;

                    if (
                        item.product_type === 'physical' &&
                        nextQuantity > Number(item.stock_quantity)
                    ) {
                        window.alert('Requested quantity exceeds available stock.');
                        return item;
                    }

                    return { ...item, quantity: nextQuantity };
                })
        );
    }

    function removeFromCart(productId) {
        setCart((previousCart) =>
            previousCart.filter((item) => item.id !== productId)
        );
    }

    function handleCheckoutChange(event) {
        const { name, value } = event.target;
        setCheckoutForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    async function submitOrder(event) {
        event.preventDefault();
        setCheckoutError('');

        if (!store?.id || cart.length === 0) {
            setCheckoutError('Your cart is empty or the store could not be identified.');
            return;
        }

        setCheckoutLoading(true);

        try {
            const response = await authenticatedRequest(`${API}/stores/${store.id}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    ...checkoutForm,
                    items: cart.map((item) => ({
                        product_id: item.id,
                        quantity: item.quantity
                    }))
                })
            });

            const result = await response.json();

            if (!response.ok) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;

                throw new Error(validationMessage || 'Unable to place your order.');
            }

            setOrderConfirmation(result.order);
            setCart([]);
            setCartOpen(false);
            setCheckoutOpen(false);
        } catch (error) {
            setCheckoutError(error.message || 'Something went wrong. Please try again.');
        } finally {
            setCheckoutLoading(false);
        }
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                background: '#f7f6f3',
                color: '#202b3c'
            }}>
                <h2>Loading store...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                padding: '24px',
                background: '#f7f6f3',
                color: '#202b3c',
                textAlign: 'center'
            }}>
                <div>
                    <h2>Unable to open this store</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const logoUrl = storefrontImageUrl(store.logo);
    const bannerUrl = storefrontImageUrl(store.banner);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f7f6f3',
            color: '#202b3c',
            fontFamily: 'Arial, sans-serif'
        }}>
            <header style={{
                background: '#202b3c',
                color: '#ffffff',
                padding: '24px 6%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt={`${store.store_name || store.business_name} logo`}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                background: '#ffffff'
                            }}
                        />
                    )}
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px' }}>
                            {store.store_name || store.business_name}
                        </h1>
                        <p style={{ margin: '7px 0 0', color: '#d6dce5' }}>
                            {store.description || 'Welcome to our online store.'}
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: 'right', color: '#d6dce5' }}>
                    <button
                        type="button"
                        onClick={() => setCartOpen((open) => !open)}
                        style={{
                            padding: '10px 16px',
                            marginBottom: '10px',
                            border: '1px solid #d6dce5',
                            borderRadius: '8px',
                            background: '#ffffff',
                            color: '#202b3c',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Cart ({cartItemCount})
                    </button>
                    {store.phone && <div>Call: {store.phone}</div>}
                    {store.whatsapp_number && (
                        <a
                            href={`https://wa.me/${String(store.whatsapp_number).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '8px',
                                color: '#ffffff',
                                textDecoration: 'underline'
                            }}
                        >
                            Contact on WhatsApp
                        </a>
                    )}
                </div>
            </header>

            {bannerUrl && (
                <img
                    src={bannerUrl}
                    alt={`${store.store_name || store.business_name} banner`}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '260px',
                        objectFit: 'cover'
                    }}
                />
            )}

            <main style={{ padding: '36px 6%' }}>
                {orderConfirmation ? (
                    <section style={{
                        maxWidth: '760px',
                        margin: '0 auto',
                        padding: '36px',
                        background: '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '58px',
                            height: '58px',
                            margin: '0 auto 16px',
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            background: '#e8f5e9',
                            color: '#237a38',
                            fontSize: '30px'
                        }}>✓</div>
                        <h2>Order placed successfully!</h2>
                        <p>Your order has been recorded.</p>
                        <div style={{
                            margin: '24px 0',
                            padding: '18px',
                            background: '#f7f6f3',
                            borderRadius: '8px'
                        }}>
                            <p><strong>Order Number:</strong> {orderConfirmation.order_number}</p>
                            <p><strong>Order Total:</strong> ₹{Number(orderConfirmation.total_amount).toFixed(2)}</p>
                            <p><strong>Order Status:</strong> {orderConfirmation.order_status}</p>
                            <p><strong>Payment Status:</strong> {orderConfirmation.payment_status}</p>
                        </div>
                        <p style={{ color: '#687386', fontSize: '13px' }}>
                            Payment is pending. Your order does not mean that payment has been received.
                        </p>
                        <button
                            type="button"
                            onClick={() => setOrderConfirmation(null)}
                            style={{
                                marginTop: '12px',
                                padding: '11px 18px',
                                border: 0,
                                borderRadius: '7px',
                                background: '#202b3c',
                                color: '#ffffff',
                                cursor: 'pointer'
                            }}
                        >
                            Continue Shopping
                        </button>
                    </section>
                ) : checkoutOpen ? (
                    <section style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: '26px',
                        background: '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ margin: 0 }}>Checkout</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setCheckoutOpen(false);
                                    setCheckoutError('');
                                }}
                                style={{
                                    padding: '9px 14px',
                                    border: '1px solid #202b3c',
                                    borderRadius: '7px',
                                    background: '#ffffff',
                                    color: '#202b3c',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Cart
                            </button>
                        </div>

                        {checkoutError && (
                            <p role="alert" style={{
                                padding: '12px',
                                background: '#fff0ef',
                                color: '#b42318',
                                borderRadius: '7px'
                            }}>{checkoutError}</p>
                        )}

                        <form onSubmit={submitOrder}>
                            <h3>Customer Details</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '16px'
                            }}>
                                {[
                                    ['customer_name', 'Full Name', 'text', true],
                                    ['customer_phone', 'Mobile Number', 'tel', true],
                                    ['customer_email', 'Email Address (Optional)', 'email', false]
                                ].map(([name, label, type, required]) => (
                                    <div className="form-group" key={name}>
                                        <label htmlFor={`checkout-${name}`}>{label}</label>
                                        <input
                                            id={`checkout-${name}`}
                                            type={type}
                                            name={name}
                                            value={checkoutForm[name]}
                                            onChange={handleCheckoutChange}
                                            required={required}
                                            maxLength={name === 'customer_phone' ? 20 : 255}
                                        />
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ marginTop: '24px' }}>Delivery Address</h3>
                            <div className="form-group">
                                <label htmlFor="checkout-address">Address</label>
                                <textarea
                                    id="checkout-address"
                                    name="delivery_address"
                                    value={checkoutForm.delivery_address}
                                    onChange={handleCheckoutChange}
                                    required
                                    rows="3"
                                />
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '16px'
                            }}>
                                {[
                                    ['city', 'City'],
                                    ['state', 'State'],
                                    ['pincode', 'PIN Code']
                                ].map(([name, label]) => (
                                    <div className="form-group" key={name}>
                                        <label htmlFor={`checkout-${name}`}>{label}</label>
                                        <input
                                            id={`checkout-${name}`}
                                            name={name}
                                            value={checkoutForm[name]}
                                            onChange={handleCheckoutChange}
                                            required
                                            maxLength={name === 'pincode' ? 10 : 255}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: '22px',
                                padding: '18px',
                                background: '#f7f6f3',
                                borderRadius: '8px'
                            }}>
                                <p style={{ margin: '0 0 8px' }}>Items: {cartItemCount}</p>
                                <p style={{ margin: '0 0 8px' }}>Cart subtotal (before server-side tax calculation): ₹{cartSubtotal.toFixed(2)}</p>
                                <p style={{ margin: 0, color: '#687386', fontSize: '13px' }}>
                                    Final discount, GST and total will be calculated securely by the store.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={checkoutLoading}
                                style={{
                                    marginTop: '20px',
                                    padding: '12px 20px',
                                    border: 0,
                                    borderRadius: '7px',
                                    background: checkoutLoading ? '#89919d' : '#202b3c',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    cursor: checkoutLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>
                    </section>
                ) : cartOpen ? (
                    <section style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: '26px',
                        background: '#ffffff',
                        border: '1px solid #e8e8e8',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            marginBottom: '22px'
                        }}>
                            <h2 style={{ margin: 0 }}>Your Shopping Cart</h2>
                            <button
                                type="button"
                                onClick={() => setCartOpen(false)}
                                style={{
                                    padding: '9px 14px',
                                    border: '1px solid #202b3c',
                                    borderRadius: '7px',
                                    background: '#ffffff',
                                    color: '#202b3c',
                                    cursor: 'pointer'
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>

                        {cart.length === 0 ? (
                            <div style={{ padding: '35px 10px', textAlign: 'center' }}>
                                <h3>Your cart is empty</h3>
                                <p style={{ color: '#687386' }}>
                                    Add products from the store to get started.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setCartOpen(false)}
                                    style={{
                                        padding: '11px 18px',
                                        border: 0,
                                        borderRadius: '7px',
                                        background: '#202b3c',
                                        color: '#ffffff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Browse Products
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    display: 'grid',
                                    gap: '14px'
                                }}>
                                    {cart.map((item) => {
                                        const image = item.images?.[0]
                                            ? getImageUrl(item.images[0])
                                            : '';

                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '80px minmax(0, 1fr) auto',
                                                    gap: '16px',
                                                    alignItems: 'center',
                                                    padding: '14px 0',
                                                    borderBottom: '1px solid #eceff2'
                                                }}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={item.product_name}
                                                        style={{
                                                            width: '80px',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        background: '#eceff2',
                                                        borderRadius: '8px',
                                                        fontSize: '11px'
                                                    }}>
                                                        No image
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 style={{ margin: '0 0 6px' }}>
                                                        {item.product_name}
                                                    </h3>
                                                    <p style={{
                                                        margin: 0,
                                                        color: '#687386',
                                                        fontSize: '13px'
                                                    }}>
                                                        ₹{item.unitPrice.toFixed(2)} each
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{
                                                            marginTop: '8px',
                                                            padding: 0,
                                                            border: 0,
                                                            background: 'transparent',
                                                            color: '#b42318',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    flexWrap: 'wrap',
                                                    justifyContent: 'flex-end'
                                                }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.id, -1)}
                                                        aria-label={`Decrease ${item.product_name} quantity`}
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            border: '1px solid #cbd1d9',
                                                            borderRadius: '6px',
                                                            background: '#ffffff',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        −
                                                    </button>
                                                    <strong>{item.quantity}</strong>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.id, 1)}
                                                        aria-label={`Increase ${item.product_name} quantity`}
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            border: '1px solid #cbd1d9',
                                                            borderRadius: '6px',
                                                            background: '#ffffff',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                    <strong style={{
                                                        minWidth: '95px',
                                                        textAlign: 'right'
                                                    }}>
                                                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                                                    </strong>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                    marginTop: '24px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setCart([])}
                                        style={{
                                            padding: '10px 14px',
                                            border: '1px solid #b42318',
                                            borderRadius: '7px',
                                            background: '#ffffff',
                                            color: '#b42318',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Clear Cart
                                    </button>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 8px', color: '#687386' }}>
                                            Subtotal
                                        </p>
                                        <h2 style={{ margin: 0 }}>
                                            ₹{cartSubtotal.toFixed(2)}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCheckoutError('');
                                                setCheckoutOpen(true);
                                            }}
                                            style={{
                                                marginTop: '14px',
                                                padding: '11px 18px',
                                                border: 0,
                                                borderRadius: '7px',
                                                background: '#202b3c',
                                                color: '#ffffff',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                ) : (
                <>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h2 style={{ margin: '0 0 6px', fontSize: '26px' }}>
                            Shop Our Collection
                        </h2>
                        <p style={{ margin: 0, color: '#687386' }}>
                            Browse products available at this store.
                        </p>
                    </div>

                    <input
                        type="search"
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{
                            width: 'min(100%, 300px)',
                            padding: '12px 14px',
                            border: '1px solid #d8dce3',
                            borderRadius: '8px',
                            background: '#ffffff',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginBottom: '26px'
                }}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '9px 16px',
                                borderRadius: '20px',
                                border: '1px solid #202b3c',
                                background: selectedCategory === category
                                    ? '#202b3c'
                                    : '#ffffff',
                                color: selectedCategory === category
                                    ? '#ffffff'
                                    : '#202b3c',
                                cursor: 'pointer'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {filteredProducts.length === 0 ? (
                    <div style={{
                        padding: '50px 20px',
                        textAlign: 'center',
                        background: '#ffffff',
                        borderRadius: '12px'
                    }}>
                        <h3>No products found</h3>
                        <p style={{ color: '#687386' }}>
                            Try another search or category.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredProducts.map((product) => {
                            const image = product.images?.[0]
                                ? getImageUrl(product.images[0])
                                : '';

                            const price = Number(
                                product.discount_price || product.price
                            );

                            const hasDiscount =
                                product.discount_price &&
                                Number(product.discount_price) < Number(product.price);

                            return (
                                <article
                                    key={product.id}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 3px 12px rgba(32, 43, 60, 0.06)'
                                    }}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={product.product_name}
                                            style={{
                                                width: '100%',
                                                height: '240px',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            height: '240px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: '#eceff2',
                                            color: '#687386'
                                        }}>
                                            No image available
                                        </div>
                                    )}

                                    <div style={{ padding: '16px' }}>
                                        <p style={{
                                            margin: '0 0 8px',
                                            color: '#7b8492',
                                            fontSize: '12px'
                                        }}>
                                            {product.category?.category_name || 'Product'}
                                        </p>

                                        <h3 style={{
                                            margin: '0 0 10px',
                                            fontSize: '18px'
                                        }}>
                                            {product.product_name}
                                        </h3>

                                        {product.description && (
                                            <p style={{
                                                margin: '0 0 14px',
                                                color: '#687386',
                                                fontSize: '13px',
                                                lineHeight: 1.5
                                            }}>
                                                {product.description}
                                            </p>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '9px'
                                        }}>
                                            <strong style={{
                                                fontSize: '18px',
                                                color: '#202b3c'
                                            }}>
                                                ₹{price.toFixed(2)}
                                            </strong>

                                            {hasDiscount && (
                                                <span style={{
                                                    color: '#89919d',
                                                    textDecoration: 'line-through',
                                                    fontSize: '13px'
                                                }}>
                                                    ₹{Number(product.price).toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        {product.product_type === 'physical' && (
                                            <p style={{
                                                margin: '10px 0 0',
                                                color: '#687386',
                                                fontSize: '12px'
                                            }}>
                                                {Number(product.stock_quantity) > 0
                                                    ? 'In stock'
                                                    : 'Out of stock'}
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => addToCart(product)}
                                            disabled={
                                                product.product_type === 'physical' &&
                                                Number(product.stock_quantity) <= 0
                                            }
                                            style={{
                                                width: '100%',
                                                marginTop: '16px',
                                                padding: '11px 14px',
                                                border: 0,
                                                borderRadius: '7px',
                                                background:
                                                    product.product_type === 'physical' &&
                                                    Number(product.stock_quantity) <= 0
                                                        ? '#aeb5bf'
                                                        : '#202b3c',
                                                color: '#ffffff',
                                                fontWeight: 600,
                                                cursor:
                                                    product.product_type === 'physical' &&
                                                    Number(product.stock_quantity) <= 0
                                                        ? 'not-allowed'
                                                        : 'pointer'
                                            }}
                                        >
                                            {product.product_type === 'physical' &&
                                            Number(product.stock_quantity) <= 0
                                                ? 'Out of Stock'
                                                : 'Add to Cart'}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
                </>
                )}
            </main>

            <footer style={{
                padding: '22px 6%',
                background: '#202b3c',
                color: '#d6dce5',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0 }}>
                    © {new Date().getFullYear()} {store.store_name || store.business_name}
                </p>
                {store.business_address && (
                    <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
                        {store.business_address}
                    </p>
                )}
            </footer>
        </div>
    );
}

const rootElement = document.getElementById('app');
const storeSlug = rootElement.dataset.storeSlug;

const root = window.__planbifyRoot || createRoot(rootElement);

window.__planbifyRoot = root;

root.render(
    storeSlug ? <Storefront storeSlug={storeSlug} /> : <App />
);