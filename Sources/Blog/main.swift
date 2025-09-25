import Foundation
import Publish
import Plot

// This type acts as the configuration for your website.
struct Blog: Website {
    enum SectionID: String, WebsiteSectionID {
        // Add the sections that you want your website to contain here:
        case posts
        case about
        case projects
    }

    struct ItemMetadata: WebsiteItemMetadata {
        // Add any site-specific metadata that you want to use here.
        var tags: [String]
        var date: Date
        var readingTime: Int // in minutes
    }

    // Update these properties to configure your website:
    var url = URL(string: "https://devyhan93.github.io")!
    var name = ""
    var description = ""
    var language: Language { .korean }
    var imagePath: Path? { nil }
}

// This will generate your website using the Foundation theme with search:
try Blog().publish(
    withTheme: .foundationWithSearch,
    additionalSteps: [
        .generateSearchIndex(includeContent: true),
        .step(named: "Copy search resources") { context in
            let searchCSS = try context.createOutputFile(at: "search.css")
            let searchJS = try context.createOutputFile(at: "search.js")

            let cssFile = try context.file(at: "Resources/search.css")
            let jsFile = try context.file(at: "Resources/search.js")

            try searchCSS.write(cssFile.read())
            try searchJS.write(jsFile.read())
        }
    ]
)
