# AskFor.Support — Resource Directory

A free, open, community-maintained directory of helpful resources and services, organized by category. The goal is to make it easy for anyone to find vetted organizations, support lines, programs, and tools that can help — no matter what they're going through.

🌐 **Live site:** [askfor.support](https://askfor.support)

## Categories

| Category | Description |
|---|---|
| [LGBTQIA2S+](lgbtqia2s.html) | Support orgs, crisis lines, community groups, legal aid, affirming providers |
| [Healthcare](healthcare.html) | Mental health, physical health, clinics, insurance navigation, telehealth |
| [Education](education.html) | Scholarships, tutoring, GED programs, continuing ed, learning tools |
| [Technology](technology.html) | Digital literacy, low-cost internet, device programs, coding resources |

## Site Structure

```
askforsupport/
├── index.html          # Homepage with category cards
├── lgbtqia2s.html      # LGBTQIA2S+ resources page
├── healthcare.html     # Healthcare resources page
├── education.html      # Education resources page
├── technology.html     # Technology resources page
├── style.css           # Shared stylesheet (mobile-responsive)
├── CNAME               # Custom domain config for GitHub Pages
└── README.md           # This file
```

## Contributing

Want to add or update a resource? [Open an issue](https://github.com/penelopethrock-cyber/askforsupport/issues) or submit a pull request.

Each resource entry follows this format in the HTML:

```html
<div class="resource-item">
  <h3>Organization Name</h3>
  <p>Brief description of what this organization offers and who it serves.</p>
  <a class="resource-link" href="https://example.org" target="_blank" rel="noopener">Visit website →</a>
</div>
```

## License

Content is shared freely. See individual resources for their own terms.
