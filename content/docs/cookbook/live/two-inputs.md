---
title: "Two Live Inputs"
---

# Using Two Live Inputs

If a customer says:

- I only want to record part of a live stream
- I have a long running live stream but want separate recordings

We do not support turning on/off the option to record and create an HLS broadcast
for a Live Input _while a stream is running._ However, you could do something like
this using a pair of Live Inputs:

``` mermaid
  flowchart TB

  Studio((Studio)) --> |broadcasts| A
  A(Input A) --> |live output to| B(Input B)
  B --> |used for| R((HLS/Record))
```

## Setup

- **Create Live Input B** -- this will be the public-facing one
  - Turn _on_ recording/HLS
  - Note the embed code or manifest URL for streaming to viewers
  - Note the RTMP connection info for the next step
- **Create Live Input A** -- this is a switch of sorts
  - Turn _off_ recording/HLS
  - Use the RTMP info from Live Input B as a restream/output here. Add it, _but turn it off._
  - Note the RTMP connection info here for studio/broadcaster use.

## Usage

- Configure your studio / OBS / broadcaster to point to Live Input A
- In Dash or via the API, turn on or off the restream to Live Input B as you need to split recordings or hide setup/pre-show/testing stuff.
- Use Live Input B for playback and recording use.
