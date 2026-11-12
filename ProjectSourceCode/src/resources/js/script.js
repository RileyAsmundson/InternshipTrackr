const internshipSearch = document.getElementById('internship-search');
const internshipSelect = document.getElementById('internship-select');
const internshipSearchStatus =
  document.getElementById('internship-search-status');
const companyInput = document.getElementById('company');
const locationInput = document.getElementById('interview-location');

if (internshipSearch &&
    internshipSelect &&
    internshipSearchStatus &&
    companyInput &&
    locationInput) {
  const internshipsById = new Map();
  let searchTimeout;
  let activeRequest;

  internshipSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    activeRequest?.abort();
    internshipsById.clear();
    companyInput.value = '';
    locationInput.value = '';

    const searchTerm = internshipSearch.value.trim();
    internshipSelect.replaceChildren(
      new Option(
        searchTerm ? 'Searching...' : 'Search to load internship listings',
        ''
      )
    );

    if (!searchTerm) {
      internshipSearchStatus.textContent = '';
      return;
    }

    internshipSearchStatus.textContent = 'Searching internship listings...';
    searchTimeout = setTimeout(async () => {
      const controller = new AbortController();
      activeRequest = controller;

      try {
        const response = await fetch(
          `/calendar/search?search=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Internship search failed: ${response.status}`);
        }

        const result = await response.json();
        if (!Array.isArray(result.internships)) {
          throw new Error('Unexpected internship search response');
        }

        if (searchTerm !== internshipSearch.value.trim()) {
          return;
        }

        internshipSelect.replaceChildren(
          new Option('Choose an internship', ''),
          ...result.internships.map(internship => {
            const id = String(internship.id);
            internshipsById.set(id, internship);

            return new Option(
              `${internship.role} — ${internship.company} (${internship.location})`,
              id
            );
          })
        );

        internshipSearchStatus.textContent =
          result.internships.length > 0
            ? `${result.internships.length} listings found`
            : 'No internship listings found.';
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        console.error('Internship Search Error:', error);
        internshipSelect.replaceChildren(
          new Option('Search failed. Try again.', '')
        );
        internshipSearchStatus.textContent =
          'Unable to load internships right now.';
      }
    }, 250);
  });

  internshipSelect.addEventListener('change', () => {
    const internship = internshipsById.get(internshipSelect.value);
    companyInput.value = internship?.company || '';
    locationInput.value = internship?.location || '';
  });
}