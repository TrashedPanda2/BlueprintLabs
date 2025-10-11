"use client";

import { useEffect, useState } from "react";
import VideoBackground from "./components/VideoBackground";

const categoryMap: Record<string, string> = {
  "0": "Assault Rifle",
  "1": "SMG",
  "2": "Shotgun",
  "3": "LMG",
  "4": "Marksman Rifle",
  "5": "Sniper",
  "6": "Pistol",
  "7": "Launchers",
  "8": "Specials",
  "9": "Melee",
};

interface BlueprintRow {
  weapon: string;
  category: string;
  blueprint: string;
  status: string;
  pool: string;
  imageBase: string;
}

export default function Home() {
  const [data, setData] = useState<BlueprintRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [poolFilter, setPoolFilter] = useState("All");

  const [showCredits, setShowCredits] = useState(false);
  const [modalImageBase, setModalImageBase] = useState<string | null>(null);
  const [modalSrc, setModalSrc] = useState<string>("");
  const [modalHasPreview, setModalHasPreview] = useState(true);

  const extensions = [".jpg", ".jpeg", ".png"];

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/weapons.json");
      const json = await res.json();
      const rows: BlueprintRow[] = [];

      for (const weapon of json.Weapons) {
        for (const bp of weapon.Blueprints) {
          if (!bp.Name || bp.Name === "NOTHING") continue;
          const weaponName = weapon.Name.toLowerCase().replace(/\s+/g, "-");
          const imageBase = `/images/${weaponName}/${bp.Name}`;
          rows.push({
            weapon: weapon.Name,
            category: categoryMap[weapon.Category],
            blueprint: bp.Name,
            status: bp.status,
            pool: bp.Pool,
            imageBase,
          });
        }
      }
      setData(rows);
    };
    loadData();
  }, []);

  const openPreview = (imageBase: string) => {
    setModalImageBase(imageBase);
    setModalHasPreview(true);
    setModalSrc(`${imageBase}${extensions[0]}`);
  };

  const handleModalImgError = () => {
    if (!modalImageBase) return;
    const currentIndex = extensions.findIndex((ext) => modalSrc === `${modalImageBase}${ext}`);
    const nextIndex = currentIndex + 1;
    if (nextIndex < extensions.length) {
      setModalSrc(`${modalImageBase}${extensions[nextIndex]}`);
    } else {
      setModalHasPreview(false);
    }
  };

  const filtered = data.filter((row) => {
    const matchesSearch =
      row.blueprint.toLowerCase().includes(search.toLowerCase()) ||
      row.weapon.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || row.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || row.category === categoryFilter;
    const matchesPool = poolFilter === "All" || row.pool === poolFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPool;
  });

  const poolOptions = Array.from(new Set(data.map((row) => row.pool))).sort(
    (a, b) => Number(a) - Number(b)
  );
  return (
    <div>
      <VideoBackground />

      <div className="container">
        <header>
          <div className="title-block">
            <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
            <h1>Blueprint Labs By: TrashedPanda</h1>
          </div>
          <div>
            <button className="btn" onClick={() => setShowCredits(true)}>
              Credits
            </button>
          </div>
        </header>

        <div className="card">
          <strong>Last Updated:</strong>
          <strong> Site is still in development, please be patient as we update</strong>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search blueprints or weapons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>RELEASED</option>
            <option>UNRELEASED</option>
            <option>NOTHING</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All</option>
            {Object.values(categoryMap).map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
          <select value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)}>
            <option>All</option>
            {poolOptions.map((pool) => (
              <option key={pool}>{pool}</option>
            ))}
          </select>
        </div>

        {/* Desktop Table */}
        <div className="table-wrapper desktop-only">
          <table>
            <thead>
              <tr>
                <th>Blueprint Name</th>
                <th>Gun Name</th>
                <th>Weapon Category</th>
                <th>Status</th>
                <th>Pool</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td>{row.blueprint}</td>
                  <td>{row.weapon}</td>
                  <td>{row.category}</td>
                  <td>{row.status}</td>
                  <td>{row.pool}</td>
                  <td>
                    <button className="btn" onClick={() => openPreview(row.imageBase)}>
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "1rem", color: "#ccc" }}>
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-only">
          {filtered.map((row, i) => (
            <div key={i} className="card blueprint-card">
              <h3>{row.blueprint}</h3>
              <p><strong>Weapon:</strong> {row.weapon}</p>
              <p><strong>Category:</strong> {row.category}</p>
              <p><strong>Status:</strong> {row.status}</p>
              <p><strong>Pool:</strong> {row.pool}</p>
              <button className="btn" onClick={() => openPreview(row.imageBase)}>
                Preview
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", padding: "1rem", color: "#ccc" }}>
              No results found.
            </p>
          )}
        </div>
      </div>
      {/* Image Modal */}
      {modalImageBase && (
        <div className="modal" onClick={() => setModalImageBase(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalHasPreview ? (
              <img
                src={modalSrc}
                onError={handleModalImgError}
                alt="Blueprint Preview"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            ) : (
              <p style={{ textAlign: "center", margin: "2rem 0", color: "#ccc" }}>
                No Preview Available
              </p>
            )}
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <button className="btn" onClick={() => setModalImageBase(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Modal */}
      {showCredits && (
        <div className="modal" onClick={() => setShowCredits(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1rem" }}>Credits</h2>
            <p style={{ marginBottom: "1rem" }}>
              BlueprintLabs is a blueprint pool website for Call of Duty weapons.
              All data is sourced from community contributions.
            </p>
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              <li><strong>Design & Development:</strong> TrashedPanda</li>
              <li><strong>Data Structuring:</strong> Data sourced by Parsedgod</li>
              <li><strong>UI/UX:</strong> Inspired by Black Ops 6 Theme</li>
              <li><strong>Assets:</strong> All logos, videos, and images are property of their respective owners</li>
            </ul>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="btn" onClick={() => setShowCredits(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
