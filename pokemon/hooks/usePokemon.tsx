import { useContext, createContext, useEffect, useState } from "react";

export type Pokemon = {
  name: string;
  url: string;
  sprite: string;
};

interface PokemonContextType {
  loadMore: () => void;
  pokemon: Pokemon[];
}

export const PokemonContext = createContext<PokemonContextType>({
  loadMore: () => {},
  pokemon: [],
});

export const usePokemon = () => {
  const context = useContext(PokemonContext);
  if (!context) {
    throw new Error("usePokemon must be used within a PokemonProvider");
  }
  return context;
};

export const PokemonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const getPokemon = async (page = 1) => {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${(page - 1) * 20}`
    );
    return await response.json();
  };

  const getPokemonDetails = async (name: string) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    return await response.json();
  };

  const fetchPokemonDetails = async (page = 1) => {
    try {
      const pokemonData = await getPokemon(page);

      for (let i = 0; i < pokemonData.results.length; i++) {
        const details = await getPokemonDetails(pokemonData.results[i].name);
        console.log(details.sprites.front_default);
        pokemonData.results[i].sprite = details.sprites.front_default;
      }

      console.log(pokemonData.results);
      // setPokemon(pokemonData.results);
      return pokemonData.results;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const pokemon = await fetchPokemonDetails();
      setPokemon(pokemon);
    };

    fetch();
  }, []);

  const loadMore = async () => {
    const nextPage = Math.floor(pokemon.length / 20) + 1;
    const newPokemon = await fetchPokemonDetails(nextPage);
    console.log({ newPokemon });
    setPokemon((prev) => [...prev, ...newPokemon]);
  };

  return (
    <PokemonContext.Provider value={{ loadMore, pokemon }}>
      {children}
    </PokemonContext.Provider>
  );
};
