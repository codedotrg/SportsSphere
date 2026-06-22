export const getLeagueStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return 'Upcoming';
  } else if (now >= start && now <= end) {
    return 'Active';
  } else {
    return 'Finished';
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500';
    case 'upcoming':
      return 'bg-blue-500';
    case 'finished':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export const getSportColor = (sport: string) => {
  switch (sport) {
    case 'Cricket':
      return 'bg-orange-100 text-orange-600';
    case 'Football':
      return 'bg-green-100 text-green-600';
    case 'Basketball':
      return 'bg-blue-100 text-blue-600';
    case 'Tennis':
      return 'bg-purple-100 text-purple-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const formatDateDisplay = (dateString: string, status: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};
