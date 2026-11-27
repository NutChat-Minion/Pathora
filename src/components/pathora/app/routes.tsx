import { createBrowserRouter } from "react-router";
import { PublicLayout, RequireAuth } from "./Layout";
import {
  Applications,
  Dashboard,
  Explore,
  Home,
  Login,
  Prepare,
  Pricing,
  Profile,
  ScholarshipDetail,
  Saved,
  SimplePage,
} from "./pages";
import {
  Accommodation,
  Community,
  PreDeparture,
  StudyBuddy,
  TravelTogether,
  Visa,
} from "./platformPages";

export const router = createBrowserRouter([
  {
    Component: PublicLayout,
    children: [
      { path: "/", Component: Home },
      { path: "/explore", Component: Explore },
      { path: "/pricing", Component: Pricing },
      { path: "/login", Component: Login },
      { path: "/scholarships/:scholarshipId", Component: ScholarshipDetail },
      { path: "/about", element: <SimplePage title="errors.about" /> },
      { path: "/support", element: <SimplePage title="errors.support" /> },
      { path: "/partners", element: <SimplePage title="errors.partners" /> },
    ],
  },
  {
    Component: RequireAuth,
    children: [
      { path: "/app", Component: Dashboard },
      { path: "/app/explore", Component: Explore },
      { path: "/app/pricing", Component: Pricing },
      { path: "/saved", Component: Saved },
      { path: "/applications", Component: Applications },
      { path: "/prepare", Component: Prepare },
      { path: "/profile", Component: Profile },
      { path: "/settings", Component: Profile },
      { path: "/community", Component: Community },
      { path: "/study-buddy", Component: StudyBuddy },
      { path: "/accommodation", Component: Accommodation },
      { path: "/visa", Component: Visa },
      { path: "/travel-together", Component: TravelTogether },
      { path: "/pre-departure", Component: PreDeparture },
    ],
  },
  { path: "*", element: <SimplePage title="errors.notFound" /> },
]);
