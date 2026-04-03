import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function ProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: localStorage.getItem('userPhone') || '',
    address: localStorage.getItem('userAddress') || '',
    city: localStorage.getItem('userCity') || '',
    state: localStorage.getItem('userState') || '',
    pincode: localStorage.getItem('userPincode') || '',
  })

  const [editMode, setEditMode] = useState(false)

  const orders = (() => {
    const saved = localStorage.getItem('userOrders')
    return saved ? JSON.parse(saved) : []
  })()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSave() {
    localStorage.setItem('userPhone', formData.phone)
    localStorage.setItem('userAddress', formData.address)
    localStorage.setItem('userCity', formData.city)
    localStorage.setItem('userState', formData.state)
    localStorage.setItem('userPincode', formData.pincode)
    setEditMode(false)
    alert('Profile updated successfully!')
  }

  if (!user) {
    return (
      <div className="panel content-page">
        <p>Please login to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <section className="profile-header panel">
          <div className="profile-avatar">
            <i className="fa-solid fa-circle-user" />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-role">Member since {new Date().getFullYear()}</p>
          </div>
          <button
            className="btn-edit-profile"
            onClick={() => setEditMode(!editMode)}
          >
            <i className="fa-solid fa-edit" /> {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </section>

        <div className="profile-content">
          {/* Profile Information Section */}
          <section className="profile-section panel">
            <h2>
              <i className="fa-solid fa-user" /> Personal Information
            </h2>

            {editMode ? (
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled
                  />
                  <small>Contact support to change your name</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>

                <button className="btn-save-profile" onClick={handleSave}>
                  <i className="fa-solid fa-check" /> Save Changes
                </button>
              </div>
            ) : (
              <div className="profile-display">
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{user.email}</span>
                </div>
                {formData.phone && (
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{formData.phone}</span>
                  </div>
                )}
                {formData.address && (
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{formData.address}</span>
                  </div>
                )}
                {formData.city && (
                  <div className="info-row">
                    <span className="label">City:</span>
                    <span className="value">{formData.city}</span>
                  </div>
                )}
                {formData.state && (
                  <div className="info-row">
                    <span className="label">State:</span>
                    <span className="value">{formData.state}</span>
                  </div>
                )}
                {formData.pincode && (
                  <div className="info-row">
                    <span className="label">Pincode:</span>
                    <span className="value">{formData.pincode}</span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Order History Section */}
          <section className="profile-section panel">
            <h2>
              <i className="fa-solid fa-box" /> Order History
            </h2>

            {orders.length === 0 ? (
              <div className="no-orders">
                <p>You haven't placed any orders yet.</p>
                <a href="/books" className="btn-browse-books">
                  <i className="fa-solid fa-book" /> Browse Books
                </a>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order: any, index: number) => (
                  <div key={index} className="order-card">
                    <div className="order-header">
                      <h3>{order.bookTitle}</h3>
                      <span className="order-date">
                        {new Date(order.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>
                        <strong>Payment ID:</strong> {order.paymentId}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{order.amount}
                      </p>
                      <p>
                        <strong>Delivery Address:</strong>
                        <br />
                        {order.address}, {order.city}, {order.state} {order.pincode}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className="status-badge completed">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
