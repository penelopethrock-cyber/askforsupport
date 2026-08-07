# Ask For Support

This is a Jekyll-based site for [Ask For Support](https://askfor.support), a categorized resource directory for LGBTQIA2S+, healthcare, education, and technology resources.

## Structure

The site is built using GitHub Pages' native Jekyll support.

## How to add new resources

To add, update, or remove a resource, simply edit the `_data/resources.yml` file. You do not need to write any HTML.

The file is structured by category (`lgbtqia2s`, `healthcare`, `education`, `technology`). For each resource, you can provide:
- `name`: Name of the organization or resource
- `description`: A short description of the services offered
- `phone`: Contact phone number (optional)
- `address`: Physical location or address (optional)
- `link`: Website URL (optional)

Example:
```yaml
healthcare:
  - name: Sample Health Clinic
    description: Provides accessible healthcare services.
    phone: "555-0199"
    address: "123 Health Ave, Cityville"
    link: "https://example.org"
```
