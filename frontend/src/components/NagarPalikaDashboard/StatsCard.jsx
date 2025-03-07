const StatsCard = ({
  icon: Icon,
  title,
  value,
  borderColor,
  iconColor,
  bgColor,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${borderColor}`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor} ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
