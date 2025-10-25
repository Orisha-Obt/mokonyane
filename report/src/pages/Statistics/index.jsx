import React, { useState, useEffect } from "react";
import { format } from "date-fns"; // You'll need to install date-fns

function Statistics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    dateRange: "all", // all, today, week, month
    sortBy: "date", // date, frequency
    search: "",
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch("/api/reports");
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports
    .filter((report) => {
      // Date filter
      if (filter.dateRange === "today") {
        const today = new Date().toDateString();
        return new Date(report.reportedAt).toDateString() === today;
      }
      if (filter.dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(report.reportedAt) >= weekAgo;
      }
      if (filter.dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(report.reportedAt) >= monthAgo;
      }

      return true;
    })
    .filter((report) => {
      // Search filter
      if (!filter.search) return true;
      return report.url.toLowerCase().includes(filter.search.toLowerCase());
    })
    .sort((a, b) => {
      // Sort
      if (filter.sortBy === "frequency") {
        return b.reportCount - a.reportCount;
      }
      return new Date(b.reportedAt) - new Date(a.reportedAt);
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reported Malicious Links
          </h1>
          <p className="mt-2 text-gray-600">
            Track and monitor reported phishing attempts
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={filter.dateRange}
                onChange={(e) =>
                  setFilter({ ...filter, dateRange: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={filter.sortBy}
                onChange={(e) =>
                  setFilter({ ...filter, sortBy: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="date">Most recent</option>
                <option value="frequency">Most reported</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search URL
              </label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                placeholder="Search by domain or URL..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reported URL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    First Reported
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Reported
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Report Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {report.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(report.firstReported), "PPp")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(report.reportedAt), "PPp")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {report.reportCount} reports
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No reports found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
