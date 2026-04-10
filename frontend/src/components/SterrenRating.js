// ============================================
// SterrenRating Component
// Toont en laat gebruiker sterren selecteren
// ============================================

function SterrenRating({ rating, onRating, readonly = false, grootte = 'normaal' }) {
  const sterren = [1, 2, 3, 4, 5];

  return (
    <div className={`sterren sterren--${grootte}`}>
      {sterren.map((ster) => (
        <span
          key={ster}
          className={`ster ${ster <= rating ? 'ster--actief' : ''} ${!readonly ? 'ster--klikbaar' : ''}`}
          onClick={() => !readonly && onRating && onRating(ster)}
        >
          {ster <= rating ? '★' : '☆'}
        </span>
      ))}
      {rating > 0 && readonly && (
        <span className="sterren__tekst">{rating}/5</span>
      )}
    </div>
  );
}

export default SterrenRating;
