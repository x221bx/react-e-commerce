export default function CategoryCard({ title, note, img, onClick = () => {} }) {
  return (
    <button onClick={onClick} className="text-left group">
      <div className="w-full aspect-square bg-center bg-cover rounded-lg overflow-hidden transform group-hover:scale-105 transition-transform duration-300"
           style={{ backgroundImage: `url('${img}')` }} />
      <div className="mt-3">
        <p className="text-base font-medium">{title}</p>
        <p className="text-earthy-brown text-sm">{note}</p>
      </div>
    </button>
  );
}
