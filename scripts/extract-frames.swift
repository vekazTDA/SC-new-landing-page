// Extracts a JPEG frame sequence from a video, for scroll-scrubbed playback on canvas.
//
//   swift scripts/extract-frames.swift <input.mp4> <outDir> <width> <count> <endSeconds> [quality]
//
// Example (desktop set used by BoxShowcaseSection):
//   swift scripts/extract-frames.swift "~/Downloads/001 - HORZ.mp4" public/frames/box-horz 1440 120 7.8
//
// Frames are written as 0001.jpg … NNNN.jpg, evenly spaced over [0, endSeconds].
// Seeks are exact (zero tolerance) so the sequence is free of duplicated frames.

import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 6 else {
    print("usage: extract-frames.swift <input> <outDir> <width> <count> <endSeconds> [quality]")
    exit(1)
}

let inputPath = (args[1] as NSString).expandingTildeInPath
let outDir = args[2]
let width = Double(args[3])!
let count = Int(args[4])!
let endSeconds = Double(args[5])!
let quality = args.count > 6 ? Double(args[6])! : 0.6

let asset = AVURLAsset(url: URL(fileURLWithPath: inputPath))
let duration = CMTimeGetSeconds(asset.duration)
guard duration > 0 else {
    print("could not read \(inputPath)")
    exit(1)
}

try? FileManager.default.createDirectory(
    atPath: outDir, withIntermediateDirectories: true
)

let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero
generator.maximumSize = CGSize(width: width, height: width * 4)

let end = min(endSeconds, duration - 0.05)
var totalBytes = 0

for i in 0..<count {
    let seconds = end * Double(i) / Double(count - 1)
    let time = CMTime(seconds: seconds, preferredTimescale: 600)

    guard let image = try? generator.copyCGImage(at: time, actualTime: nil) else {
        print("failed at \(seconds)s")
        continue
    }

    let rep = NSBitmapImageRep(cgImage: image)
    guard let data = rep.representation(
        using: .jpeg, properties: [.compressionFactor: quality]
    ) else { continue }

    let name = String(format: "%04d.jpg", i + 1)
    try? data.write(to: URL(fileURLWithPath: outDir).appendingPathComponent(name))
    totalBytes += data.count

    if i == 0 || i == count - 1 {
        print("  \(name) @ \(String(format: "%.2f", seconds))s — \(image.width)x\(image.height)")
    }
}

print("\(count) frames → \(outDir) (\(String(format: "%.1f", Double(totalBytes) / 1_048_576.0)) MB)")
