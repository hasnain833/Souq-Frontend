import PropTypes from 'prop-types';

function MegaMenu({ category, onClose }) {
  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg z-50"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-4 gap-8 p-8">
        {category.subcategories.map((subcategory) => (
          <div key={subcategory} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">{subcategory}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Popular
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  New arrivals
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Best sellers
                </a>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

MegaMenu.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    subcategories: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default MegaMenu;