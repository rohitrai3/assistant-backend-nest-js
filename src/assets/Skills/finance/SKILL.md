---
name: finance
description: Use this skill for requests related to transaction in order to create, read, and update transactions in Finance app.
allowed-tools: ping-finance, add-finance
---

# finance

## Overview

This skill explains how to access Finance app to help create, read, and update transactional information.

## Instructions

### 1. Check status of Finance app

Use `ping-finance` tool to check if Finance app is online or not.

If Finance app is offline, notify user about it and do not proceed forward.

If Finance app is online, proceed further.

### 1. Check operation

Based on the question, identify whether user wants to create, read or update the transaction.

### 2. If create operation

1. Extract following fields from question:
1.1. Amount: number specifies the amount of transaction.
1.2. Type: whether it is a credit or debit transaction.
1.3. Description: infere from the question what this transaction about.
1.4. Tags: based on description, create some tags to group the transaction.
1.5. Date: when was the transaction made.

2. If any of the fields is missing, ask the user to provide information for them.

3. Use `add-finance` tool to create transaction.

4. Notify about the response to the user.

### 3. If read operation

Notify user that this operation is not yet supported.

### 4. If update operation

Notify user that this operation is not yet supported.

