import { Link } from "react-router-dom";
import { Empty } from "../components/EventCard.jsx";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container section">
      <Empty icon={SearchX} title="This page doesn't exist">
        The link may be broken or the page was moved. <Link className="link" to="/">Browse events</Link>
      </Empty>
    </div>
  );
}
