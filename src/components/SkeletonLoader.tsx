
const SkeletonLoader = ({ lines = 3, className = "" }: { lines?: number; className?: string }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className="h-4 bg-purple-200 rounded-lg mb-3 opacity-12"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
    <div className="w-24 h-24 bg-purple-200 rounded-full mx-auto mb-4 opacity-12" />
    <div className="h-6 bg-purple-200 rounded-lg mb-3 opacity-12" />
    <div className="h-4 bg-purple-200 rounded-lg mb-2 opacity-12 w-3/4 mx-auto" />
    <div className="h-4 bg-purple-200 rounded-lg mb-4 opacity-12 w-1/2 mx-auto" />
    <div className="h-10 bg-purple-200 rounded-xl opacity-12" />
  </div>
);

export default SkeletonLoader;
