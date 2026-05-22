import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#172337] mt-auto">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-[12px] font-semibold text-gray-400 tracking-wider uppercase mb-4">
              About
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-xs text-white hover:underline">Contact Us</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">About Us</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Help
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-xs text-white hover:underline">Payments</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Shipping</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Cancellation & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Policy
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-xs text-white hover:underline">Return Policy</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Terms of Use</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Security</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Social
            </h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-xs text-white hover:underline">Facebook</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">Twitter</Link></li>
              <li><Link to="/" className="text-xs text-white hover:underline">YouTube</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-600 pt-6 flex justify-between items-center">
          <p className="text-xs text-white">
            &copy; {new Date().getFullYear()} Flipkart Clone.
          </p>
          <div className="flex space-x-4">
            <span className="text-xs text-white flex items-center"><span className="text-secondary mr-1">★</span> Become a Seller</span>
            <span className="text-xs text-white flex items-center"><span className="text-secondary mr-1">★</span> Advertise</span>
            <span className="text-xs text-white flex items-center"><span className="text-secondary mr-1">★</span> Gift Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
