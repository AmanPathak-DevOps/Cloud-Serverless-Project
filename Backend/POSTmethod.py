# import the JSON utility package
import json
import uuid
# import the AWS SDK (for Python the package name is boto3)
import boto3
# import two packages to help us with dates and date formatting
from time import gmtime, strftime
from datetime import datetime, timedelta

# create a DynamoDB object using the AWS SDK
dynamodb = boto3.resource('dynamodb')
# use the DynamoDB object to select our table
table = dynamodb.Table('Student-Details')

# Get the current UTC time
utc_now = datetime.utcnow()

# Calculate the Indian Standard Time (IST) offset (5 hours and 30 minutes)
ist_offset = timedelta(hours=5, minutes=30)

# Calculate the IST time by adding the offset to the UTC time
ist_now = utc_now + ist_offset

# Format the IST time in a human-readable format
ist_now_str = ist_now.strftime("%a, %d %b %Y %H:%M:%S +0530 IST")


# define the handler function that the Lambda service will use as an entry point
def lambda_handler(event, context):
    try:
        # extract the three values from the Lambda service's event object
        roll_number = str(event['roll_number'])
        student_name = event['student_name']
        student_class = str(event['student_class'])

        # Generate a unique ID
        unique_id = str(uuid.uuid4())

        # store the item in DynamoDB
        response = table.put_item(
            Item={
                'ID': unique_id,
                'roll_number': roll_number,
                'student_name': student_name,
                'student_class': student_class,
                'LatestGreetingTime': ist_now_str
            })
        
        return {
            'statusCode': 200,
        }
    except Exception as e:
        # handle exceptions and return an error response
        return {
            'statusCode': 500,
            'body': json.dumps('Error: {}'.format(str(e)))
        }
