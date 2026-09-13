
import { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  UtensilsCrossed,
} from 'lucide-react';

import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/helpers';

import type {
  Food,
  Category,
  Restaurant,
} from '@/lib/types';

import './AdminPages.css';

const EMPTY: Record<string, string> = {
  title: '',
  description: '',
  image: '',
  price: '',
  category_id: '',
  restaurant_id: '',
  rating: '4.5',
  available: 'true',
};

export default function AdminFoods() {
  const { show } = useToast();

  const [foods, setFoods] =
    useState<Food[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [restaurants, setRestaurants] =
    useState<Restaurant[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const [modal, setModal] =
    useState(false);

  const [editing, setEditing] =
    useState<Food | null>(null);

  const [form, setForm] =
    useState<Record<string, string>>({
      ...EMPTY,
    });

  // ======================================================
  // LOAD DATA
  // ======================================================

  async function load() {
    setLoading(true);

    try {
      const [
        foodsResponse,
        categoriesResponse,
        restaurantsResponse,
      ] = await Promise.all([
        api.get('/foods'),
        api.get('/categories'),
        api.get('/restaurants'),
      ]);

      const foodData =
        foodsResponse.data?.foods || [];

      const categoryData =
        categoriesResponse.data?.categories ||
        [];

      const restaurantData =
        restaurantsResponse.data?.restaurants ||
        [];

      setFoods(foodData);
      setCategories(categoryData);
      setRestaurants(restaurantData);
    } catch (error: any) {
      console.error(
        'Load foods error:',
        error
      );

      setFoods([]);
      setCategories([]);
      setRestaurants([]);

      show(
        error?.response?.data?.message ||
          'Could not load food data',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ======================================================
  // ADD
  // ======================================================

  function openAdd() {
    setEditing(null);

    setForm({
      ...EMPTY,
      category_id:
        categories[0]?.id || '',
      restaurant_id:
        restaurants[0]?.id || '',
    });

    setModal(true);
  }

  // ======================================================
  // EDIT
  // ======================================================

  function openEdit(food: Food) {
    setEditing(food);

    setForm({
      title: food.title || '',
      description:
        food.description || '',
      image: food.image || '',
      price: String(
        food.price ?? ''
      ),
      category_id:
        food.category_id || '',
      restaurant_id:
        food.restaurant_id || '',
      rating: String(
        food.rating ?? 4.5
      ),
      available: String(
        food.available
      ),
    });

    setModal(true);
  }

  // ======================================================
  // CREATE / UPDATE
  // ======================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),

      description:
        form.description.trim(),

      image:
        form.image.trim(),

      price:
        parseFloat(form.price) || 0,

      category_id:
        form.category_id || null,

      restaurant_id:
        form.restaurant_id || null,

      rating:
        parseFloat(form.rating) || 4.5,

      available:
        form.available === 'true',
    };

    try {
      if (editing) {
        await api.put(
          `/foods/${editing.id}`,
          payload
        );

        show('Food updated!');
      } else {
        await api.post(
          '/foods',
          payload
        );

        show('Food added!');
      }

      setModal(false);

      await load();
    } catch (error: any) {
      console.error(
        'Food save error:',
        error
      );

      show(
        error?.response?.data?.message ||
          'Operation failed',
        'error'
      );
    }
  }

  // ======================================================
  // DELETE
  // ======================================================

  async function handleDelete(
    food: Food
  ) {
    if (
      !confirm(
        `Delete "${food.title}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/foods/${food.id}`
      );

      show('Food deleted');

      await load();
    } catch (error: any) {
      console.error(
        'Delete food error:',
        error
      );

      show(
        error?.response?.data?.message ||
          'Could not delete',
        'error'
      );
    }
  }

  // ======================================================
  // SEARCH
  // ======================================================

  const filtered = foods.filter(
    (food) =>
      food.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <h1 className="admin-title">
          Food Management
        </h1>

        <button
          className="btn btn-primary"
          onClick={openAdd}
        >
          <Plus size={18} />
          Add Food
        </button>
      </div>

      {/* SEARCH */}

      <div className="admin-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* FOOD TABLE */}

      {loading ? (
        <p className="text-muted">
          Loading...
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">
          No foods found.
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (food) => (
                  <tr key={food.id}>
                    <td>
                      <img
                        src={food.image}
                        alt={food.title}
                        className="admin-thumb"
                      />
                    </td>

                    <td>
                      <strong>
                        {food.title}
                      </strong>
                    </td>

                    <td>
                      {food.categories
                        ?.name || '—'}
                    </td>

                    <td>
                      {formatPrice(
                        food.price
                      )}
                    </td>

                    <td>
                      {food.rating} ★
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          food.available
                            ? 'badge-success'
                            : 'badge-error'
                        }`}
                      >
                        {food.available
                          ? 'Yes'
                          : 'No'}
                      </span>
                    </td>

                    <td>
                      <div className="admin-actions">
                        <button
                          onClick={() =>
                            openEdit(food)
                          }
                          className="admin-action-btn"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(food)
                          }
                          className="admin-action-btn danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================
          MODAL
      ================================================== */}

      {modal && (
        <div
          className="admin-modal-overlay"
          onClick={() =>
            setModal(false)
          }
        >
          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <h2>
                {editing
                  ? 'Edit Food'
                  : 'Add Food'}
              </h2>

              <button
                onClick={() =>
                  setModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-modal-form"
            >
              {/* TITLE */}

              <div className="form-group">
                <label className="form-label">
                  Title
                </label>

                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-textarea"
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* IMAGE */}

              <div className="form-group">
                <label className="form-label">
                  Image URL
                </label>

                <input
                  className="form-input"
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image:
                        e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>

              {/* PRICE + RATING */}

              <div className="admin-form-row">
                <div className="form-group">
                  <label className="form-label">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Rating
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="form-input"
                    value={form.rating}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rating:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* CATEGORY + RESTAURANT */}

              <div className="admin-form-row">
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>

                  <select
                    className="form-select"
                    value={
                      form.category_id
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category_id:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      None
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Restaurant
                  </label>

                  <select
                    className="form-select"
                    value={
                      form.restaurant_id
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        restaurant_id:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      None
                    </option>

                    {restaurants.map(
                      (restaurant) => (
                        <option
                          key={
                            restaurant.id
                          }
                          value={
                            restaurant.id
                          }
                        >
                          {restaurant.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* AVAILABLE */}

              <div className="form-group">
                <label className="form-label">
                  Available
                </label>

                <select
                  className="form-select"
                  value={form.available}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      available:
                        e.target.value,
                    })
                  }
                >
                  <option value="true">
                    Yes
                  </option>

                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              {/* FOOTER */}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <UtensilsCrossed
                    size={18}
                  />

                  {editing
                    ? 'Update'
                    : 'Add'}{' '}
                  Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
