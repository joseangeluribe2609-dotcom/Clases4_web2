import { useEffect, useState } from 'react';
import './App.css';

const BASE_URL = 'https://rickandmortyapi.com/api/character';

const fallbackCharacters = [
  {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    origin: { name: 'Earth (C-137)' },
    location: { name: 'Earth (Replacement Dimension)' },
    image: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="#1f2937"/>
        <circle cx="150" cy="110" r="66" fill="#a7f3d0"/>
        <rect x="88" y="170" width="125" height="74" rx="18" fill="#e0f2fe"/>
        <text x="150" y="285" text-anchor="middle" font-family="Arial" font-size="26" fill="#ffffff">Rick</text>
      </svg>
    `),
    gender: 'Male',
    type: 'Scientist',
    episode: Array.from({ length: 20 }),
  },
  {
    id: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    origin: { name: 'Earth (C-137)' },
    location: { name: 'Earth (Replacement Dimension)' },
    image: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="#172554"/>
        <circle cx="150" cy="110" r="66" fill="#bfdbfe"/>
        <rect x="90" y="170" width="120" height="70" rx="18" fill="#dbeafe"/>
        <text x="150" y="285" text-anchor="middle" font-family="Arial" font-size="26" fill="#ffffff">Morty</text>
      </svg>
    `),
    gender: 'Male',
    type: 'Student',
    episode: Array.from({ length: 18 }),
  },
  {
    id: 3,
    name: 'Summer Smith',
    status: 'Alive',
    species: 'Human',
    origin: { name: 'Earth (C-137)' },
    location: { name: 'Earth (Replacement Dimension)' },
    image: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="#3b0764"/>
        <circle cx="150" cy="110" r="66" fill="#f9a8d4"/>
        <rect x="88" y="170" width="124" height="74" rx="18" fill="#fce7f3"/>
        <text x="150" y="285" text-anchor="middle" font-family="Arial" font-size="26" fill="#ffffff">Summer</text>
      </svg>
    `),
    gender: 'Female',
    type: 'Teenager',
    episode: Array.from({ length: 16 }),
  },
  {
    id: 4,
    name: 'Beth Smith',
    status: 'Alive',
    species: 'Human',
    origin: { name: 'Earth (C-137)' },
    location: { name: 'Earth (Replacement Dimension)' },
    image: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
        <rect width="100%" height="100%" fill="#7c2d12"/>
        <circle cx="150" cy="110" r="66" fill="#fdba74"/>
        <rect x="90" y="170" width="120" height="72" rx="18" fill="#ffedd5"/>
        <text x="150" y="285" text-anchor="middle" font-family="Arial" font-size="26" fill="#ffffff">Beth</text>
      </svg>
    `),
    gender: 'Female',
    type: 'Horse surgeon',
    episode: Array.from({ length: 14 }),
  },
];

async function fetchCharactersByPage(page) {
  try {
    const response = await fetch(`${BASE_URL}?page=${page}`);

    if (!response.ok) {
      throw new Error('No se pudo obtener la información de los personajes.');
    }

    const data = await response.json();

    return {
      results: data.results || [],
      totalPages: data.info?.pages || 1,
    };
  } catch (error) {
    return {
      results: fallbackCharacters,
      totalPages: 1,
      warning: 'La API externa no responde; se muestran datos de respaldo.',
    };
  }
}

async function fetchCharacterById(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error('No se pudo cargar el detalle del personaje.');
    }

    return response.json();
  } catch (error) {
    const fallbackCharacter = fallbackCharacters.find((character) => character.id === Number(id));

    if (fallbackCharacter) {
      return fallbackCharacter;
    }

    throw new Error('No se pudo abrir el detalle del personaje.');
  }
}

function getStatusClass(status = 'unknown') {
  return status.toLowerCase();
}

function filterCharactersByNameAndStatus(characters, searchText, selectedStatus) {
  return characters.filter((character) => {
    const matchesName = character.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || character.status === selectedStatus;

    return matchesName && matchesStatus;
  });
}

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadCharacters = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCharactersByPage(page);
        setCharacters(data.results);
        setTotalPages(data.totalPages);
        setNotice(data.warning || '');
      } catch (err) {
        setError(err.message || 'Ocurrió un error inesperado.');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [page, refreshKey]);

  const filteredCharacters = filterCharactersByNameAndStatus(
    characters,
    search,
    statusFilter,
  );

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleOpenDetails = async (id) => {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const character = await fetchCharacterById(id);
      setSelectedCharacter(character);
    } catch (err) {
      setDetailError(err.message || 'No se pudo abrir el detalle del personaje.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCharacter(null);
    setDetailError(null);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">API con React</p>
          <h1>Personajes de Rick and Morty</h1>
        </div>

        <button type="button" className="refresh-button" onClick={handleRefresh}>
          Recargar
        </button>
      </header>

      {!loading && !error && (
        <div className="toolbar" aria-label="Herramientas de la lista">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar personaje..."
            value={search}
            onChange={handleSearchChange}
          />

          <select className="status-select" value={statusFilter} onChange={handleStatusChange}>
            <option value="all">Todos</option>
            <option value="Alive">Vivos</option>
            <option value="Dead">Muertos</option>
            <option value="unknown">Desconocidos</option>
          </select>

          <button type="button" className="clear-button" onClick={handleClearFilters}>
            Limpiar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="pagination-bar" aria-label="Paginación de personajes">
          <button type="button" onClick={handlePreviousPage} disabled={page === 1}>
            Anterior
          </button>

          <span>
            Página {page} de {totalPages}
          </span>

          <button type="button" onClick={handleNextPage} disabled={page === totalPages}>
            Siguiente
          </button>
        </div>
      )}

      {notice && <div className="state-card warning">{notice}</div>}

      {loading && <div className="state-card">Cargando personajes...</div>}

      {error && <div className="state-card error">{error}</div>}

      {!loading && !error && (
        <section className="character-grid" aria-live="polite">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((character) => (
              <article key={character.id} className="character-card">
                <button
                  type="button"
                  className="character-button"
                  onClick={() => handleOpenDetails(character.id)}
                >
                  <img src={character.image} alt={character.name} className="character-image" />

                  <div className="character-info">
                    <h2>{character.name}</h2>

                    <p className="meta">
                      <span className={`status-dot ${getStatusClass(character.status)}`}></span>
                      {character.status} - {character.species}
                    </p>

                    <p>
                      <strong>Origen:</strong> {character.origin.name}
                    </p>

                    <p>
                      <strong>Ubicación:</strong> {character.location.name}
                    </p>
                  </div>
                </button>
              </article>
            ))
          ) : (
            <div className="state-card">No hay personajes con esos filtros.</div>
          )}
        </section>
      )}

      {selectedCharacter && (
        <div className="detail-overlay" onClick={handleCloseDetails}>
          <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
            {detailLoading ? (
              <div className="state-card">Cargando detalle...</div>
            ) : detailError ? (
              <div className="state-card error">{detailError}</div>
            ) : (
              <>
                <button type="button" className="close-button" onClick={handleCloseDetails}>
                  Cerrar
                </button>

                <div className="detail-content">
                  <img
                    src={selectedCharacter.image}
                    alt={selectedCharacter.name}
                    className="detail-image"
                  />

                  <div className="detail-info">
                    <p className="eyebrow detail-eyebrow">Detalle del personaje</p>
                    <h2>{selectedCharacter.name}</h2>

                    <p className="meta detail-meta">
                      <span className={`status-dot ${getStatusClass(selectedCharacter.status)}`}></span>
                      {selectedCharacter.status} - {selectedCharacter.species}
                    </p>

                    <p>
                      <strong>Género:</strong> {selectedCharacter.gender}
                    </p>
                    <p>
                      <strong>Origen:</strong> {selectedCharacter.origin.name}
                    </p>
                    <p>
                      <strong>Ubicación:</strong> {selectedCharacter.location.name}
                    </p>
                    <p>
                      <strong>Episodios:</strong> {selectedCharacter.episode.length}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {selectedCharacter.type || 'Sin tipo'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}