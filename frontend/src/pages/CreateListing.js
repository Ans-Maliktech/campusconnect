import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card,Alert  } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
// Add this line to the top of both CreateListing.js and EditListing.js
/**
 * Create Listing Page
 * Form to post new items
 */
const CreateListing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'Good',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Tutoring Services'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.description || !formData.price) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.price < 0) {
      setError('Price cannot be negative');
      setLoading(false);
      return;
    }

    try {
      await API.post('/listings', formData);
      alert('Listing created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="mb-4">Post a New Listing</h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="e.g., Data Structures Textbook"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    placeholder="Describe your item in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price  *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        placeholder="Enter price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Condition *</Form.Label>
                  <Form.Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                  >
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Image URL (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Paste a link to an image of your item (use imgur.com or similar)
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? 'Creating...' : 'Create Listing'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    className="flex-grow-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default CreateListing;