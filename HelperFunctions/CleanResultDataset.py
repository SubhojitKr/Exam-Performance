import pandas as pd

df = pd.read_csv("../Datasets/Engineering_and_IT/Computer_Science_and_IT/B_Tech_in_CSE/22-26/1st_sem_result.csv")

df = df.fillna('-')

df.to_csv("output.csv", index=False)

