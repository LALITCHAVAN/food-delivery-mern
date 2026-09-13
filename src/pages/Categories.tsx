import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "@/lib/api";
import type { Category, Food } from "@/lib/types";
import FoodCard from "@/components/FoodCard";
import Spinner from "@/components/Spinner";
import "./Categories.css";

const PAGE_SIZE = 8;

export default function Categories() {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(initialSearch);
  const [activeCat, setActiveCat] = useState<string>(
    categoryName || "All"
  );
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [catRes, foodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/foods"),
        ]);

        setCategories(
          (catRes.data.categories || []) as Category[]
        );

        setFoods(
          (foodRes.data.foods || []) as Food[]
        );
      } catch (error) {
        console.error("Categories load error:", error);

        setCategories([]);
        setFoods([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    setActiveCat(categoryName || "All");
    setPage(1);
  }, [categoryName]);

  useEffect(() => {
    setSearch(initialSearch);
    setPage(1);
  }, [initialSearch]);

  const filtered = useMemo(() => {
    let list = [...foods];

    if (activeCat !== "All") {
      list = list.filter(
        (food) => food.categories?.name === activeCat
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();

      list = list.filter(
        (food) =>
          food.title?.toLowerCase().includes(q) ||
          food.description?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;

      case "name":
        list.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;

      default:
        list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [foods, activeCat, search, sortBy]);

  const totalPages = Math.ceil(
    filtered.length / PAGE_SIZE
  );

  const paged = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Explore Foods</h1>
        <p className="text-muted">
          Browse all our delicious offerings
        </p>
      </div>

      <div className="cat-toolbar">
        <div className="cat-search">
          <Search
            size={18}
            className="cat-search-icon"
          />

          <input
            type="text"
            placeholder="Search foods..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="cat-sort">
          <SlidersHorizontal size={18} />

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="popular">
              Most Popular
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Top Rated
            </option>

            <option value="name">
              Name (A-Z)
            </option>
          </select>
        </div>
      </div>

      <div className="cat-pills">
        <Link
          to="/categories"
          className={`cat-pill ${
            activeCat === "All" ? "active" : ""
          }`}
          onClick={() => {
            setActiveCat("All");
            setPage(1);
          }}
        >
          All
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.name}`}
            className={`cat-pill ${
              activeCat === category.name
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveCat(category.name);
              setPage(1);
            }}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <p className="cat-results-count">
        {filtered.length} items found
      </p>

      {paged.length === 0 ? (
        <div className="empty-state">
          <h3>No foods found</h3>
          <p>Try a different search or category.</p>
        </div>
      ) : (
        <div className="food-grid">
          {paged.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
            disabled={page === 1}
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((number) => (
            <button
              key={number}
              className={`page-btn ${
                page === number ? "active" : ""
              }`}
              onClick={() => setPage(number)}
            >
              {number}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={page === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
