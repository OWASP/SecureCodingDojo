The purpose of this challenge is to demonstrate the MITRE Top 25 programming flaw: 'Improper Input Validation'. Given that this CWE is broad and covers many different underlying attacks, the focus of this challenge will be in logical operations.

> *"The product receives input or data, but it does not validate or incorrectly validates that the input has the properties that are required to process the data safely and correctly."*
> - From MITRE [CWE 20](https://cwe.mitre.org/data/definitions/20.html) 

The developer of the vulnerable application has implemented a subscription page for users to renew subscription to the service. The developer has not considered all possibilities that should be validated with the untrusted data coming from the user. Find a way to renew the subscription without paying any money.