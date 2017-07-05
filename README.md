# Barebones-Framework
A bare bones web application framework. The intention is to strip down the standard web application frameworks to the bare bones and allow for an end developer the options to add functionality and complexity that is relevant to their project.

## Basic Design
The core design for the web application framework is to implement the following:
1. Request routing
2. Middleware (pre/post)
3. HTML template language

## Data Flow
The data will flow through the pipeline as follows:
Initial Request > Middleware (pre) > Routed Function > Middleware (post) > Response
