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
    var name = "DevYhan's Tech Blog"
    var description = "개발 경험과 기술 인사이트를 공유하는 블로그"
    var language: Language { .korean }
    var imagePath: Path? { nil }
}

// This will generate your website using the built-in Foundation theme:
try Blog().publish(withTheme: .foundation)