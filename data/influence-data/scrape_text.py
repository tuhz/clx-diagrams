#!/usr/bin/env python
"""Pulls in a text file and builds a json file based on that data. constructed as
the data ingetion mechanism for the influence diagram"""

import json
with open('text-rip.txt') as f:
    CONTENT = f.readlines()
# you may also want to remove whitespace characters like `\n` at the end of each line
CONTENT = [x.strip() for x in CONTENT]
PEOPLE = []
for i in range(0, len(CONTENT) / 2):
    PEOPLE.append({
        "name": CONTENT[2 * i + 0],
        "active": CONTENT[2 * i  + 1],
        "links": []
    })

print PEOPLE
with open('people.json', 'w') as outfile:
    json.dump(PEOPLE, outfile)
