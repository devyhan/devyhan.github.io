import Foundation
import Publish
import Plot

struct SearchIndexGenerator<Site: Website> {
    let context: PublishingContext<Site>
    let includeContent: Bool

    init(context: PublishingContext<Site>, includeContent: Bool = true) {
        self.context = context
        self.includeContent = includeContent
    }

    func generate() throws {
        let searchItems = collectSearchItems()
        let jsonData = try JSONEncoder().encode(searchItems)

        let outputFile = try context.createOutputFile(at: "search-index.json")
        try outputFile.write(jsonData)
    }

    private func collectSearchItems() -> [SearchItem] {
        var items: [SearchItem] = []

        // Collect all posts from all sections
        for section in context.sections {
            for item in section.items {
                let searchItem = SearchItem(
                    title: item.title,
                    description: item.description,
                    content: includeContent ? item.content.body.html.removingHTMLTags() : "",
                    url: item.path.absoluteString,
                    tags: item.tags.map { $0.string },
                    section: section.id.rawValue,
                    date: item.date.timeIntervalSince1970
                )
                items.append(searchItem)
            }
        }

        // Add pages if needed
        for page in context.pages.values {
            // Skip the index page
            if page.path.string != "index" {
                let searchItem = SearchItem(
                    title: page.title,
                    description: page.description,
                    content: includeContent ? page.content.body.html.removingHTMLTags() : "",
                    url: page.path.absoluteString,
                    tags: [],
                    section: "page",
                    date: Date().timeIntervalSince1970
                )
                items.append(searchItem)
            }
        }

        return items
    }
}

struct SearchItem: Encodable {
    let title: String
    let description: String
    let content: String
    let url: String
    let tags: [String]
    let section: String
    let date: Double
}

extension String {
    func removingHTMLTags() -> String {
        return self.replacingOccurrences(of: "<[^>]+>", with: " ", options: .regularExpression, range: nil)
            .replacingOccurrences(of: "&[^;]+;", with: " ", options: .regularExpression, range: nil)
            .replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression, range: nil)
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

extension PublishingStep where Site == Blog {
    static func generateSearchIndex(includeContent: Bool = true) -> Self {
        .step(named: "Generate search index") { context in
            let generator = SearchIndexGenerator(
                context: context,
                includeContent: includeContent
            )
            try generator.generate()
        }
    }
}