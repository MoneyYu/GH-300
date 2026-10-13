// Create a Node.js console version-range checker in a single function.
// Read version and range from process.argv, for example:
// node src\cli.js 1.10.0 ">=1.9.0"
// Accept only complete stable x.y.z versions and one comparator:
// =, >, >=, <, <=. No operator means equality.
// Reject leading zeros, unsafe integers and unsupported syntax.
// Keep parsing, comparison, validation and output inside one function.
// Print the result in Traditional Chinese.
// A valid false result exits 0; invalid input prints an error and exits 1.
// This checks range membership, not real API compatibility or upgrade safety.
