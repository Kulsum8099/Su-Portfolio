import { Link } from 'react-router';
import { usePageMeta } from '../../hooks/usePageMeta';

const AdminNotFound = () => {
  usePageMeta({ title: 'Not found · Admin', noIndex: true });
  return (
    <div className="surface px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">This admin page doesn’t exist</h1>
      <Link to="/admin" className="btn btn-secondary mt-6">
        Back to projects
      </Link>
    </div>
  );
};

export default AdminNotFound;
