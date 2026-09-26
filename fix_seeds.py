import re

seed_file = "src/lib/db/seedFixtures.ts"
with open(seed_file, "r") as f:
    content = f.read()

# I will just replace the English-only translations arrays with English and Swedish
replacements = [
    (
        '{ language_code: "en", text: "And those who have responded to their lord and established prayer and whose affair is [determined by] consultation among themselves, and from what We have provided them, they spend.", source: "Saheeh International" }',
        '{ language_code: "en", text: "And those who have responded to their lord and established prayer and whose affair is [determined by] consultation among themselves, and from what We have provided them, they spend.", source: "Saheeh International" },\n      { language_code: "sv", text: "Och de som hörsammar sin Herres kallelse och förrättar bönen, och som i allt vad de företar sig rådgör med varandra, och som ger av det som Vi har skänkt dem,", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "So by mercy from Allah, [O Muhammad], you were lenient with them. And if you had been rude [in speech] and harsh in heart, they would have disbanded from about you...", source: "Saheeh International" }',
        '{ language_code: "en", text: "So by mercy from Allah, [O Muhammad], you were lenient with them. And if you had been rude [in speech] and harsh in heart, they would have disbanded from about you...", source: "Saheeh International" },\n      { language_code: "sv", text: "I Sin barmhärtighet lät Gud dig visa dem mildhet; om du hade varit sträng och hårdhjärtad hade de helt säkert dragit sig ifrån dig.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], \\"uff,\\" and do not repel them but speak to them a noble word.", source: "Saheeh International" }',
        '{ language_code: "en", text: "And your Lord has decreed that you not worship except Him, and to parents, good treatment. Whether one or both of them reach old age [while] with you, say not to them [so much as], \\"uff,\\" and do not repel them but speak to them a noble word.", source: "Saheeh International" },\n      { language_code: "sv", text: "Er Herre har befallt, att ni inte skall dyrka någon annan än Honom. Och [Han har anbefallt er] att visa godhet mot [era] föräldrar. Om en av dem eller båda uppnår hög ålder hos dig, säg då inte \\"Uff\\" till dem och snäs inte av dem, utan tala till dem med respekt.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "O you who have believed, indeed, among your wives and your children are enemies to you, so beware of them. But if you pardon and overlook and forgive - then indeed, Allah is Forgiving and Merciful.", source: "Saheeh International" }',
        '{ language_code: "en", text: "O you who have believed, indeed, among your wives and your children are enemies to you, so beware of them. But if you pardon and overlook and forgive - then indeed, Allah is Forgiving and Merciful.", source: "Saheeh International" },\n      { language_code: "sv", text: "Troende! Bland era hustrur och era barn finns de som [kan bli] era fiender; var alltså på er vakt mot dem! Men om ni har överseende [med dem] och förlåter dem, [skall ni veta att] Gud är ständigt förlåtande, barmhärtig.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "And I did not create the jinn and mankind except to worship Me.", source: "Saheeh International" }',
        '{ language_code: "en", text: "And I did not create the jinn and mankind except to worship Me.", source: "Saheeh International" },\n      { language_code: "sv", text: "Jag har skapat de osynliga väsendena och människorna enbart för att de skall dyrka Mig.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -", source: "Saheeh International" }',
        '{ language_code: "en", text: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -", source: "Saheeh International" },\n      { language_code: "sv", text: "Han som har skapat döden och livet för att sätta er på prov [och se] vem av er som i sina handlingar är bäst. Han är den Mäktige, Den som ständigt förlåter.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "O you who have believed, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves or parents and relatives.", source: "Saheeh International" }',
        '{ language_code: "en", text: "O you who have believed, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves or parents and relatives.", source: "Saheeh International" },\n      { language_code: "sv", text: "Troende! Slå vakt om rätten och rättvisan och träd fram som vittnen inför Gud, även om det skulle vara mot er själva eller era föräldrar och nära anhöriga.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "And do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness.", source: "Saheeh International" }',
        '{ language_code: "en", text: "And do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness.", source: "Saheeh International" },\n      { language_code: "sv", text: "Och låt inte avsky för [vissa] människor driva er till orättvisa; [nej] var rättvisa - detta ligger gudsfruktan närmast.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "Say, \\"O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.\\"", source: "Saheeh International" }',
        '{ language_code: "en", text: "Say, \\"O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins.\\"", source: "Saheeh International" },\n      { language_code: "sv", text: "Säg: \\"Mina tjänare, ni som har gjort orätt mot er själva, misströsta inte om Guds nåd! Gud förlåter alla synder.\\"", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.", source: "Saheeh International" }',
        '{ language_code: "en", text: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.", source: "Saheeh International" },\n      { language_code: "sv", text: "de som tror och vilkas hjärtan finner ro i ihågkommandet av Gud - ja, i ihågkommandet av Gud finner hjärtat ro!", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned.", source: "Saheeh International" }',
        '{ language_code: "en", text: "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned.", source: "Saheeh International" },\n      { language_code: "sv", text: "Gud lägger inte på någon en tyngre börda än han kan bära. Det goda han har gjort skall räknas honom till förtjänst och det onda han har gjort skall läggas honom till last.", source: "Knut Bernström" }'
    ),
    (
        '{ language_code: "en", text: "Take what is given freely, enjoin what is good, and turn away from the ignorant.", source: "Saheeh International" }',
        '{ language_code: "en", text: "Take what is given freely, enjoin what is good, and turn away from the ignorant.", source: "Saheeh International" },\n      { language_code: "sv", text: "Gör det till en regel att ha överseende och förlåta, uppmana till allt vad som är rätt och riktigt, och vänd dig ifrån de oförståndiga.", source: "Knut Bernström" }'
    )
]

for r in replacements:
    content = content.replace(r[0], r[1])

with open(seed_file, "w") as f:
    f.write(content)

print("Updated seedFixtures.ts")
