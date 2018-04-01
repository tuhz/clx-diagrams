import json
with open('text-rip.txt') as f:
    content = f.readlines()
# you may also want to remove whitespace characters like `\n` at the end of each line
content = [x.strip() for x in content]
people = []
for i in range(0, len(content) / 2):
    people.append({
        "name": content[2 * i + 0],
        "active": content[2 * i  + 1],
        "links": []
    })

print(people)
with open('people.json', 'w') as outfile:
    json.dump(people, outfile)