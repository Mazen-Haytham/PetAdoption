import AdopterPetCard from "./AdopterPetCard";

export default function AdopterPetGrid({
  pets,
  canRequestAdoption,
  onRequestAdopt,
  onRequestBlocked,
  showFavorite,
  favoritesLoaded,
  favoritePetPostIds,
  favoriteBusyId,
  onToggleFavorite,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {pets.map((pet) => {
        const key =
          pet?.petPostId ?? pet?.PetPostId ?? pet?.id ?? pet?.name ?? Math.random();
        return (
          <AdopterPetCard
            key={key}
            pet={pet}
            canRequestAdoption={canRequestAdoption}
            onRequestAdopt={onRequestAdopt}
            onRequestBlocked={onRequestBlocked}
            showFavorite={showFavorite}
            favoritesLoaded={favoritesLoaded}
            favoritePetPostIds={favoritePetPostIds}
            favoriteBusyId={favoriteBusyId}
            onToggleFavorite={onToggleFavorite}
          />
        );
      })}
    </div>
  );
}
